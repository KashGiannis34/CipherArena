<script>
    import { fade } from 'svelte/transition';
    import LoadingOverlay from './LoadingOverlay.svelte';
    import { cipherTypes } from '$db/shared-utils/CipherTypes';

    let { value = '', onSearch = () => {} } = $props();

    const searchOptions = [
        { key: 'all', label: 'show all games', example: 'most recent games' },
        { key: 'cipher:', label: 'cipher', example: 'cipher type' },
        { key: 'username:', label: 'username', example: 'player name' },
        { key: 'ranked:', label: 'ranked (true/false)', example: 'true or false' },
        { key: 'playerLimit:', label: 'player limit', example: 'max players allowed' },
        { key: 'playerCount:', label: 'player count', example: 'current players' }
    ];

    let inputElement;
    let showAutocomplete = $state(false);
    let autocompleteOptions = $state([]);
    let currentSearchOption = $state(null);
    let currentInput = $state('');
    let tokens = $state([]);
    let isLoading = $state(false);
    let activeKey = $state(null);
    let keyInValue = $state(false);
    let selectedOptionIndex = $state(0);

    $effect(() => {
        tokens = parseSearchTokens(value);
    });

    function isCompleteToken(word) {
        if (word === 'all') return true;
        return searchOptions.some(opt => opt.key === word);
    }

    function parseSearchTokens(text) {
        if (!text.trim()) return [];

        const tokens = [];
        const words = text.split(' ');

        const activeKeyIndex = activeKey ? words.indexOf(activeKey) : -1;

        let i = 0;
        while (i < words.length) {
            const word = words[i];
            if (!word) {
                i++;
                continue;
            }

            if (i === activeKeyIndex) {
                break;
            }

            if (isCompleteToken(word)) {
                tokens.push({ text: word, isToken: true, isError: false, type: 'key' });
                if (i + 1 < words.length && !isCompleteToken(words[i + 1])) {
                    const value = words[i + 1];
                    const isRanked = word === 'ranked:';
                    const isValid = !isRanked || ['true', 'false'].includes(value.toLowerCase());
                    tokens.push({
                        text: value,
                        isToken: true,
                        isError: isRanked && !isValid,
                        type: 'value',
                        parentKey: word
                    });
                    i += 2;
                } else {
                    i++;
                }
            } else {
                tokens.push({ text: word, isToken: false, isError: false });
                i++;
            }
        }

        return tokens;
    }

    function getValueAutocompleteOptions(key) {
        if (key === 'cipher:') {
            return Object.keys(cipherTypes).map(type => ({
                key: type,
                label: type,
                example: `Search for ${type} ciphers`
            }));
        } else if (key === 'ranked:') {
            return [
                { key: 'true', label: 'true (ranked games)', example: 'ranked games only' },
                { key: 'false', label: 'false (casual games)', example: 'casual games only' }
            ];
        } else if (key === 'playerLimit:' || key === 'playerCount:') {
            return [];
        }
        return [];
    }

    function getFullKeyValueAutocompleteOptions(input) {
        if (!input) return [];
        const options = [];
        const lowerInput = input.toLowerCase();

        if (searchOptions.some(opt => opt.key.toLowerCase().startsWith(lowerInput)) || activeKey) {
            return [];
        }

        if (Object.keys(cipherTypes).some(type => type.toLowerCase().includes(lowerInput))) {
            const matchingTypes = Object.keys(cipherTypes).filter(type =>
                type.toLowerCase().includes(lowerInput)
            );
            matchingTypes.forEach(type => {
                options.push({
                    key: 'cipher:',
                    value: type,
                    label: `Search for ${type} ciphers`,
                    fullText: `cipher: ${type}`,
                    type: 'full-pair'
                });
            });
        }

        if ('true'.includes(lowerInput) || 'false'.includes(lowerInput)) {
            const boolValue = lowerInput.startsWith('t') ? 'true' : 'false';
            options.push({
                key: 'ranked:',
                value: boolValue,
                label: `${boolValue === 'true' ? 'Ranked' : 'Casual'} games only`,
                fullText: `ranked: ${boolValue}`,
                type: 'full-pair'
            });
        }

        if (input.length >= 2) {
            options.push({
                key: 'username:',
                value: input,
                label: `Search for player "${input}"`,
                fullText: `username: ${input}`,
                type: 'full-pair'
            });
        }

        const numValue = parseInt(input);
        if (!isNaN(numValue) && numValue > 0) {
            if (numValue <= 10) {
                options.push({
                    key: 'playerLimit:',
                    value: input,
                    label: `Games with ${input} player limit`,
                    fullText: `playerLimit: ${input}`,
                    type: 'full-pair'
                });
                options.push({
                    key: 'playerCount:',
                    value: input,
                    label: `Games with ${input} current players`,
                    fullText: `playerCount: ${input}`,
                    type: 'full-pair'
                });
            }
        }

        return options;
    }

    function updateAutocomplete() {
        if (!currentInput) {
            if (activeKey) {
                autocompleteOptions = getValueAutocompleteOptions(activeKey);
            } else {
                const hasOtherKeys = value.split(' ').some(word => isCompleteToken(word) && word !== 'all');
                autocompleteOptions = hasOtherKeys ?
                    searchOptions.filter(opt => opt.key !== 'all') :
                    searchOptions;
            }
            showAutocomplete = true;
            currentSearchOption = null;
        } else if (activeKey) {
            const options = getValueAutocompleteOptions(activeKey);
            autocompleteOptions = options.filter(opt =>
                opt.key.toLowerCase().includes(currentInput.toLowerCase())
            );
            showAutocomplete = autocompleteOptions.length > 0;
            currentSearchOption = null;
        } else if (!currentInput.includes(' ')) {
            const keyMatches = searchOptions.filter(opt =>
                opt.key.toLowerCase().startsWith(currentInput.toLowerCase())
            );

            if (keyMatches.length === 0) {
                autocompleteOptions = getFullKeyValueAutocompleteOptions(currentInput);
            } else {
                const hasOtherKeys = value.split(' ').some(word => isCompleteToken(word) && word !== 'all');
                autocompleteOptions = hasOtherKeys ?
                    keyMatches.filter(opt => opt.key !== 'all') :
                    keyMatches;
            }
            showAutocomplete = autocompleteOptions.length > 0;
            currentSearchOption = null;
        } else {
            showAutocomplete = false;
            currentSearchOption = null;
        }
        if (autocompleteOptions.length > 0) {
            selectedOptionIndex = 0;
        }
    }

    function handleInput(e) {
        currentInput = e.target.value;

        if (currentInput.endsWith(' ')) {
            const words = currentInput.trim().split(' ');
            const lastWord = words[words.length - 1];

            if (isCompleteToken(lastWord)) {
                if (lastWord === 'all') {
                    const otherKeys = value.split(' ').some(word => isCompleteToken(word) && word !== 'all');
                    if (!otherKeys) {
                        value = lastWord;
                    }
                } else {
                    const words = value.split(' ').filter(word => word !== 'all');
                    value = (words.length > 0 ? words.join(' ') + ' ' : '') + lastWord;
                }
                currentInput = '';
                activeKey = lastWord === 'all' ? null : lastWord;
                keyInValue = lastWord !== 'all';
                if (lastWord !== 'all') {
                    autocompleteOptions = getValueAutocompleteOptions(lastWord);
                    showAutocomplete = true;
                }
            }
        }

        updateAutocomplete();
    }

    function handleFocus() {
        if (!currentInput) {
            autocompleteOptions = searchOptions;
            showAutocomplete = true;
        } else {
            updateAutocomplete();
        }
    }

    function handleBlur(e) {
        setTimeout(() => {
            if (!e.relatedTarget?.closest('.autocomplete')) {
                showAutocomplete = false;
            }
        }, 100);
    }

    async function commitSearch() {
        if (currentInput.trim()) {
            value = (value ? value + ' ' : '') + currentInput.trim();
            currentInput = '';
        }
        isLoading = true;
        try {
            await onSearch({ searchValue: value });
        } finally {
            isLoading = false;
        }
    }

    function handleKeydown(e) {
        if (showAutocomplete && autocompleteOptions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedOptionIndex = (selectedOptionIndex + 1) % autocompleteOptions.length;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedOptionIndex = (selectedOptionIndex - 1 + autocompleteOptions.length) % autocompleteOptions.length;
            } else if (e.key === 'Enter' && selectedOptionIndex >= 0) {
                e.preventDefault();
                selectAutocomplete(autocompleteOptions[selectedOptionIndex]);
                return;
            }
        }

        if (e.key === 'Backspace' && !currentInput) {
            const words = value.split(' ');
            if (words.length > 0) {
                const lastWord = words[words.length - 1];
                words.pop();
                value = words.join(' ');

                if (!isCompleteToken(lastWord) && words.length > 0) {
                    const lastKey = words[words.length - 1];
                    if (isCompleteToken(lastKey)) {
                        activeKey = lastKey;
                        words.pop();
                        value = words.join(' ');
                        keyInValue = false;
                        autocompleteOptions = getValueAutocompleteOptions(lastKey);
                        showAutocomplete = true;
                    } else {
                        activeKey = null;
                        keyInValue = false;
                        autocompleteOptions = searchOptions;
                        showAutocomplete = true;
                    }
                } else {
                    activeKey = null;
                    keyInValue = false;
                    autocompleteOptions = searchOptions;
                    showAutocomplete = true;
                }
            } else {
                activeKey = null;
                keyInValue = false;
                autocompleteOptions = searchOptions;
                showAutocomplete = true;
            }
        } else if (e.key === 'Tab' && showAutocomplete && autocompleteOptions.length > 0) {
            e.preventDefault();
            selectAutocomplete(autocompleteOptions[selectedOptionIndex]);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeKey && currentInput.trim()) {
                if (!keyInValue) {
                    value = (value ? value + ' ' : '') + activeKey + ' ' + currentInput.trim();
                } else {
                    value = (value ? value + ' ' : '') + currentInput.trim();
                }
                currentInput = '';
                activeKey = null;
                keyInValue = false;
            } else if (currentInput.trim()) {
                value = (value ? value + ' ' : '') + currentInput.trim();
                currentInput = '';
            }
            commitSearch();
        } else if (e.key === ':') {
            const potentialToken = currentInput + ':';
            if (isCompleteToken(potentialToken)) {
                e.preventDefault();
                value = (value ? value + ' ' : '') + potentialToken;
                currentInput = '';
                activeKey = potentialToken;
                keyInValue = true;
                autocompleteOptions = getValueAutocompleteOptions(potentialToken);
                showAutocomplete = true;
            }
        } else if (e.key === ' ' && activeKey && currentInput.trim()) {
            e.preventDefault();
            if (!keyInValue) {
                value = (value ? value + ' ' : '') + activeKey + ' ' + currentInput.trim();
            } else {
                value = (value ? value + ' ' : '') + currentInput.trim();
            }
            currentInput = '';
            activeKey = null;
            keyInValue = false;
        }
    }

    function selectAutocomplete(option) {
        if (option.type === 'full-pair') {
            const words = value.split(' ').filter(word => word !== 'all');
            value = (words.length > 0 ? words.join(' ') + ' ' : '') + option.fullText;
            currentInput = '';
            activeKey = null;
            keyInValue = false;
            showAutocomplete = false;
        } else if (activeKey) {
            if (!keyInValue) {
                value = (value ? value + ' ' : '') + activeKey + ' ' + option.key;
            } else {
                value = (value ? value + ' ' : '') + option.key;
            }
            currentInput = '';
            activeKey = null;
            keyInValue = false;
            showAutocomplete = false;
        } else {
            value = (value ? value + ' ' : '') + option.key;
            activeKey = option.key;
            keyInValue = true;
            autocompleteOptions = getValueAutocompleteOptions(option.key);
            showAutocomplete = true;
        }
        currentInput = '';
        inputElement.focus();
    }

    $effect(() => {
        if (autocompleteOptions) {
            selectedOptionIndex = 0;
        }
    });
</script>

<div class="search-container">
    <div class="search-input-wrapper">
        {#each tokens as token, i}
            {#if token.isToken}
                {#if token.type === 'key'}
                    <span class="search-token {token.text === 'all' ? 'all-token' : ''} {tokens[i+1]?.type === 'value' ? 'has-value' : ''}">{token.text}</span>
                {:else if token.type === 'value'}
                    <span class="search-token-group">
                        {#if i > 0 && tokens[i-1].type !== 'key'}
                            <span class="search-token has-value">{token.parentKey}</span>
                        {/if}
                        <span class="search-token value {token.isError ? 'error' : ''}">{token.text}</span>
                    </span>
                {/if}
            {:else}
                <span class="search-text">{token.text}</span>
            {/if}
        {/each}
        {#if activeKey}
            <span class="search-token active-key {activeKey === 'all' ? 'all-token' : ''}">{activeKey}</span>
        {/if}
        <input
            bind:this={inputElement}
            type="text"
            bind:value={currentInput}
            oninput={handleInput}
            onkeydown={handleKeydown}
            onfocus={handleFocus}
            onblur={handleBlur}
            placeholder={tokens.length === 0 && !activeKey ? "Search" : ""}
            class="search-input"
            name="searchQuery"
            id="searchQuery"
        />
        <button
            class="search-button"
            onclick={commitSearch}
            title="Search"
            aria-label="Search"
            tabindex="-1"
        >
            <i class="fas fa-search"></i>
        </button>
    </div>

    {#if showAutocomplete}
        <div class="autocomplete" transition:fade={{ duration: 100 }}>
            <div class="autocomplete-header">
                {#if autocompleteOptions[0]?.type === 'full-pair'}
                    MATCHING FILTERS
                {:else}
                    SEARCH OPTIONS
                {/if}
            </div>
            {#each autocompleteOptions as option, i}
                <div
                    class="autocomplete-option {i === selectedOptionIndex ? 'selected' : ''}"
                    onclick={() => selectAutocomplete(option)}
                    onmouseenter={() => selectedOptionIndex = i}
                    onkeydown={()=>{}}
                    tabindex="0"
                    role="option"
                    aria-selected={i === selectedOptionIndex}
                    aria-label={option.type === 'full-pair' ? option.label : `${option.key} - ${option.label}`}
                >
                    <div class="option-label">
                        <span class="option-key">
                            {option.type === 'full-pair' ? option.fullText : option.key}
                        </span>
                        <span class="option-description">{option.label}</span>
                    </div>
                    <div class="option-example">
                        <span class="example-text">{option.example}</span>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    {#if isLoading}
        <div class="loading-overlay">
            <LoadingOverlay />
        </div>
    {/if}
</div>

<style>
    .search-container {
        position: relative;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
    }

    .search-input-wrapper {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;
        padding: 8px 12px;
        font-size: 16px;
        border: none;
        background: transparent;
        color: white;
        border-bottom: 1px solid rgba(218, 218, 255, 0.8);
        transition: border-color 0.2s ease;
        min-height: 40px;
        width: 100%;
    }

    .search-input {
        flex: 1;
        min-width: 250px;
        border: none;
        background: transparent;
        color: white;
        outline: none;
        font-size: 16px;
        padding: 4px 0;
        padding-right: 36px;
    }

    .search-button {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: rgba(235, 219, 255, 0.538);
        cursor: pointer;
        padding: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease;
        font-size: 16px;
    }

    .search-button:hover {
        color: rgba(235, 219, 255, 0.8);
    }

    .search-button:active {
        transform: translateY(-50%) scale(0.95);
    }

    .search-token-group {
        display: inline-flex;
        align-items: center;
        margin: 0 2px;
    }

    .search-token {
        background: var(--color-primary);
        color: var(--text-primary);
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: 500;
        white-space: nowrap;
    }

    .search-token.has-value {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .search-token.all-token {
        border-radius: 4px !important;
        border-right: none !important;
    }

    .search-token.active-key {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    .search-token.value {
        background: var(--color-primary-dark);
        margin-left: 1px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .search-text {
        color: white;
        white-space: nowrap;
    }

    .search-token.error {
        background: var(--color-error-dark);
    }

    .search-input::placeholder {
        color: rgba(235, 219, 255, 0.538);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 600px) {
        .search-input {
            min-width: 200px;
        }

        .search-input::placeholder {
            font-size: 14px;
        }
    }

    .autocomplete {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-bg-card);
        border: 1px solid var(--color-gray-border);
        border-radius: 4px;
        margin-top: 4px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        overflow: hidden;
    }

    .autocomplete-header {
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-neutral-700);
        background: var(--color-neutral-950);
        letter-spacing: 0.5px;
    }

    .autocomplete-option {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
        border-left: 2px solid transparent;
        user-select: none;
    }

    .autocomplete-option:hover,
    .autocomplete-option.selected {
        background-color: var(--color-gray-border);
        border-left-color: var(--color-primary);
    }

    .autocomplete-option.selected {
        background-color: var(--color-gray-border-dark);
    }

    .autocomplete-option:hover.selected {
        background-color: var(--color-gray-border);
    }

    .option-label {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .option-key {
        color: var(--color-primary);
        font-weight: 500;
    }

    .option-description {
        color: var(--color-neutral-300);
    }

    .option-example {
        color: var(--color-neutral-700);
        font-size: 12px;
        font-style: italic;
    }

    .example-text::before {
        content: 'e.g., ';
        opacity: 0.7;
    }

    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
    }
</style>