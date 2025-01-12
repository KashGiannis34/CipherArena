<script>
    import {
        Button,
        Dropdown,
        DropdownItem,
        DropdownMenu,
        DropdownToggle,
        Styles
    } from '@sveltestrap/sveltestrap';

    let isOpen = $state(false);
  </script>

<Styles />
<div class="dropdown">
    <Dropdown {isOpen} theme="dark">
        <DropdownToggle caret>Menu</DropdownToggle>
        <DropdownMenu>
            <DropdownItem>Some Action</DropdownItem>
            <DropdownItem divider />
            <Dropdown direction="right">
                <DropdownToggle caret class="dropdown-item">
                    Submenu
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem on:click={() => alert('Alpha!')}>Alpha</DropdownItem>
                    <DropdownItem on:click={() => alert('Bravo!')}>Bravo</DropdownItem>
                    <DropdownItem on:click={() => alert('Charlie!')}>Charlie</DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </DropdownMenu>
    </Dropdown>
</div>

<style>
    .dropdown{
        transition: none;
        transform: none;
    }
</style>