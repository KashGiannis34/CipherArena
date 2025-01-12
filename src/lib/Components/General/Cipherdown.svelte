<script>
    import {
        Button,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Styles
    } from '@sveltestrap/sveltestrap';
    import {cipherTypes} from '$lib/util/CipherTypes';

    let isOpen = $state(false);
    function link(cipher) {
        window.location.href = "/singleplayer/" + cipher;
    }

    function linkParam(cipher, name, option) {
        const nOption = option[0] === "!" ? option.substring(1) : option;
        window.location.href = "/singleplayer/" + cipher + "?" + name + "=" + nOption;
    }

  </script>

<Styles />
<div class="dropdown">
    <Dropdown {isOpen} theme="dark">
        <DropdownToggle caret>Ciphers</DropdownToggle>
        <DropdownMenu>
            {#each Object.entries(cipherTypes) as [cipher, props]}
                {#if Object.keys(props['options']).length >= 1}
                    <Dropdown direction="right">
                        <DropdownToggle caret class="dropdown-item">
                            {cipher}
                        </DropdownToggle>
                        <DropdownMenu>
                            {#each Object.values(props['options'])[0] as option}
                                <DropdownItem onclick={() => {linkParam(cipher, Object.keys(props['options'])[0], option)}}>
                                    {#if option[0] === "!"}
                                        {option.substring(1)}
                                    {:else}
                                        {Object.keys(props['options'])[0]+option}
                                    {/if}
                                </DropdownItem>
                            {/each}
                        </DropdownMenu>
                    </Dropdown>
                {:else}
                    <DropdownItem onclick={() => {link(cipher)}}>{cipher}</DropdownItem>
                {/if}
                {console.log(cipher)}
                {console.log(props)}
            {/each}
        </DropdownMenu>
    </Dropdown>
</div>

<style>
    :global {
        .show {
            transition: none !important;
        }

        .btn:not(.dropdown-item) {
            margin: 10px;
            padding: 5px 15px;
            text-align: center;
            text-transform: uppercase;
            transition: 0.5s !important;
            background-size: 200% auto;
            color: white;
            border-radius: 10px;
            display: block;
            border: 0px;
            font-weight: 700;
            box-shadow: 0px 0px 14px -7px #f019e9;
            background-image: linear-gradient(45deg, #8d2fff 0%, #5619f0  51%, #2f2fff  100%);
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation !important;
        }

        .btn:not(.dropdown-item):hover {
            background-position: right center;
            /* change the direction of the change here */
            color: #fff;
            text-decoration: none;
        }

        .btn:not(.dropdown-item):active {
            transform: scale(0.95);
        }
    }
</style>