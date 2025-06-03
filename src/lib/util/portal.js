export function portal(node, targetId = 'modals') {
const target = document.getElementById(targetId);
    if (target) {
        target.appendChild(node);
    }

    return {
        destroy() {
        if (target && node.parentNode === target) {
            target.removeChild(node);
        }
        }
    };
}