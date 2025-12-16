<script>
	import Cropper from 'svelte-easy-crop';

	let { imageSrc, onSave, onCancel } = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
	let croppedAreaPixels = $state(null);
	let cropError = $state('');

	function onCropComplete(event) {
		croppedAreaPixels = event.pixels;
	}

	async function getCroppedImage() {
		if (!imageSrc || !croppedAreaPixels) {
			throw new Error('Missing image source or crop area');
		}

		const image = new Image();
		image.src = imageSrc;

		await new Promise((resolve, reject) => {
			image.onload = resolve;
			image.onerror = () => reject(new Error('Failed to load image'));
		});

		const canvas = document.createElement('canvas');
		canvas.width = croppedAreaPixels.width;
		canvas.height = croppedAreaPixels.height;
		const ctx = canvas.getContext('2d');

		ctx.drawImage(
			image,
			croppedAreaPixels.x,
			croppedAreaPixels.y,
			croppedAreaPixels.width,
			croppedAreaPixels.height,
			0,
			0,
			croppedAreaPixels.width,
			croppedAreaPixels.height
		);

		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) reject(new Error('Failed to create image blob'));
				else resolve(blob);
			}, 'image/png');
		});
	}

	async function handleSave() {
		cropError = '';
		try {
			const croppedBlob = await getCroppedImage();
			onSave(croppedBlob);
		} catch (err) {
			cropError = err.message || 'Failed to crop image.';
		}
	}

	function handleCancel() {
		onCancel();
	}
</script>

<div class="modal">
    <div class="crop-container">
        <Cropper
        image={imageSrc}
        bind:crop
        bind:zoom
        aspect={1}
        cropShape="round"
        showGrid={false}
        oncropcomplete={onCropComplete}
        />
    </div>
    <div class="controls">
        <input
        type="range"
        min="1"
        max="3"
        step="0.1"
        bind:value={zoom}
        />
        <button onclick={handleSave}>Save</button>
        <button onclick={handleCancel}>Cancel</button>
    </div>
    {#if cropError}
      <p class="error-message">{cropError}</p>
    {/if}
</div>

<style>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.crop-container {
    position: relative;
    width: 300px;
    height: 300px;
    background: #333;
    margin-bottom: 1rem;
}

.controls {
    display: flex;
    gap: 1rem;
}

button {
    padding: 0.5rem 1rem;
    background: #fff;
    border: none;
    cursor: pointer;
}

input[type="range"] {
    width: 200px;
}

.error-message {
  color: var(--color-error-dark);
  background: rgba(0, 0, 0, 0.4);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
</style>
