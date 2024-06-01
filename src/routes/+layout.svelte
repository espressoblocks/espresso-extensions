<script>
    import { page } from '$app/stores';

    import NavigationBar from "$lib/NavigationBar/Component.svelte";
    import { searchQuery, showingAddSourceModal, operationInProgress, currentOperation, extensions } from '$lib/stores.js';

    import localforage from 'localforage';

    let url;

    const onSearch = (event) => {
        const query = event.detail;
        $searchQuery = query;
    };

    const toggle = () => {
        $showingAddSourceModal = !$showingAddSourceModal;
    }

    //ive typed this so many tiems im starting to memorize it
    const blobToDataUri = (blob) => new Promise((resolve, reject) => {
        const filereader = new FileReader();
        filereader.onload = (e) => resolve(e.target.result);
        filereader.onerror = reject;
        filereader.readAsDataURL(blob);
    });

    const addSource = async () => {
        if ($operationInProgress) return;
        /**
         * @type {array}
        */
       let result;

       $operationInProgress = true;

       $currentOperation = "Downloading source";
       
       try {
        result = await fetch(url).then(data => data.json());
       } catch {
        //oh nested try fetch fucking kill me immediately
        try {
            result = await fetch("https://corsproxy.io/?" + encodeURIComponent(url)).then(data => data.json());
        } catch {
            alert("failed to download source :(");
            $operationInProgress = false;
            return;
        }
       }

       if (!Array.isArray(result)) {
        alert("Invalid source format! Must be an array.");
        $operationInProgress = false;
        return;
       }

       //oke now lets ad the extensinos
       //use for loop instead of map cause its async friendly
       $currentOperation = "Getting extensions from source..";
       for (const ext of result) {
        if (!typeof ext === "object") {
            alert("Invalid source format! Extension items must be an object");
            $operationInProgress = false;
            return;
        }

        $currentOperation = "Downloading " + ext.name;

        /**
         * @type {string}
         */
        let extcode;

        try {
            extcode = await fetch(ext.url).then(data => data.text());
        } catch {
            try {
                extcode = await fetch("https://corsproxy.io/?" + encodeURIComponent(ext.url)).then(data => data.text());
            } catch {
                alert("failed to download extension " + ext.name + "! :(");
                $operationInProgress = false;
                return;
            }
        }
        //data uri-ify it
        let Extdatauri = await blobToDataUri(new Blob([extcode], {type: 'text/javascript'}));

        //thats the new url
        ext.url = Extdatauri;

        let currentExtensions = JSON.parse((await localforage.getItem("espresso:extensions")) ?? "[]");

        currentExtensions.push(ext);

        //save the extensions
        await localforage.setItem("espresso:extensions", JSON.stringify(currentExtensions));

        //now update the store
        $extensions = currentExtensions;
       }

       toggle();
       $operationInProgress = false;
       $currentOperation = '';
    }
</script>

<NavigationBar
    displaySearchBar={$page.url.pathname === '/'}
    on:search={onSearch}
/>
<div style="height: 3rem;" />
{#if $showingAddSourceModal}
<div class="addsourcecontainer">
    <div class="addsource">
        <h1>Add source</h1>
        <input type="url" name="URL" id="Sourceurl" bind:value={url}>
        <button on:click={addSource}>Download extensions</button>
        {#if $operationInProgress}
            <p>{$currentOperation}</p>
        {/if}
    </div>
</div>
{/if}
<slot />

<style>
    .addsourcecontainer {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.411);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .addsource {
        background-color: #333;
        color: white;
        font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 20px;
        border-radius: 12px;
        border: 2px solid brown;
    }

    button {
        background-color: #222;
        color: white;
        font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        padding: 10px;
        border-radius: 12px;
        border: 2px solid brown;
        cursor: pointer;
    }
</style>