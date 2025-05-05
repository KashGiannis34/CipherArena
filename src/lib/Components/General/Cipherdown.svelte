<script>
    import {
        Button,
        Dropdown,
        DropdownMenu,
        DropdownToggle,
        Styles
    } from '@sveltestrap/sveltestrap';

    let {children, title, isMenu, onclick} = $props();

    let isOpen = $state(false);
  </script>

<Styles />
<Dropdown {isOpen} theme="dark" setActiveFromChild>
    <DropdownToggle caret={isMenu} onclick={onclick}>{title}</DropdownToggle>
    {#if isMenu}
        <DropdownMenu>
            {@render children?.()}
        </DropdownMenu>
    {/if}
</Dropdown>