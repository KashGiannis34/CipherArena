<script>
    import ProfilePicture from '$lib/Components/General/ProfilePicture.svelte';
    import CropModal from '$lib/Components/General/CropModal.svelte';
    import { fade } from 'svelte/transition';
    import LoadingOverlay from './LoadingOverlay.svelte';
    let { profilePicture, size = 120, isOwnProfile = false, sendError} = $props();

    let showCropModal = $state(false);
    let uploadedImage = $state(null);
    let hover = $state(false);
    let tooltipVisible = $state(false);
    let isUploading = $state(false);

    function handleCancel() {
        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage);
            uploadedImage = null;
        }
        showCropModal = false;
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload a JPG, PNG, or WEBP image.');
            return;
        }

        if (uploadedImage) {
			URL.revokeObjectURL(uploadedImage);
		}
        uploadedImage = URL.createObjectURL(file); // Use blob URL for Cropper
        showCropModal = true;
    }

    async function handleCropped(blob) {
        isUploading = true;
        sendError("");
        const formData = new FormData();
        formData.append('profilePicture', blob, 'profile.png');

        try {
            showCropModal = false;
            const res = await fetch('/api/profile/upload', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (result.success) {
                if (uploadedImage) {
                    URL.revokeObjectURL(uploadedImage);
                    uploadedImage = null;
                }
                window.location.reload();
            } else {
                sendError(result.error);
            }
        } catch (err) {
            sendError(err.message);
        }
        isUploading = false;
    }
</script>

<div class="pfp-wrapper" onmouseenter={() => hover = true} onmouseleave={() => hover = false} role="button" tabindex="0">
    <ProfilePicture {profilePicture} {size} useColorRing={true} />
    {#if isOwnProfile}
        <label class="camera-icon">
        <input type="file" accept="image/*" onchange={handleFileChange} hidden />
        {#if tooltipVisible}
            <div class="tooltip" transition:fade>Change profile picture</div>
        {/if}
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" onmouseenter={() => tooltipVisible = true} onmouseleave={() => tooltipVisible = false} role="button" tabindex="0">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm3.92.92l10.06-10.06 0.92 0.92L7.84 19.09H6.92v-0.92zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"/>
        </svg>
        </label>
    {/if}
</div>

{#if showCropModal}
    <CropModal imageSrc={uploadedImage} onSave={handleCropped} onCancel={handleCancel} />
{/if}

{#if isUploading}
    <LoadingOverlay />
{/if}

<style>
    .pfp-wrapper {
        position: relative;
        display: inline-block;
    }

    .camera-icon {
        opacity: 0.9;
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: #2a2a2a;
        border-radius: 50%;
        padding: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tooltip {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(6px);
        background-color: #333;
        color: #fff;
        font-size: 0.8rem;
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        white-space: nowrap;
        z-index: 10;
        opacity: 0.95;
        pointer-events: none;
    }
</style>