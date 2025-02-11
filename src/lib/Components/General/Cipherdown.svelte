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

<style>
    :global {
        .show {
            transition: none !important;
        }

        .btn:not(.dropdown-item) {
            padding: 5px 15px;
            text-align: center;
            text-transform: uppercase;
            transition: 0.5s !important;
            background-size: 200% auto;
            color: white;
            border-radius: 6px;
            display: block;
            border: 0px;
            font-weight: 700;
            background-color: transparent !important;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
            touch-action: manipulation !important;
        }

        .btn:not(.dropdown-item):active {
            transform: scale(0.95);
        }

        .btn:not(.dropdown-item):hover {
            background-color: #00000030 !important;
        }

        .btn:not(.dropdown-item):focus {
            background-color: #00000070 !important;
        }
    }
</style>