<script>
    import {
        Button,
        Dropdown,
        DropdownMenu,
        DropdownToggle,
        Styles
    } from '@sveltestrap/sveltestrap';

    let {children, title} = $props();

    let isOpen = $state(false);
  </script>

<Styles />
<Dropdown {isOpen} theme="dark" setActiveFromChild>
    <DropdownToggle caret>{title}</DropdownToggle>
    <DropdownMenu>
        {@render children?.()}
    </DropdownMenu>
</Dropdown>