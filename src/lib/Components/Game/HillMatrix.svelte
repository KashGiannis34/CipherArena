<script>
  import MatrixInput from "./MatrixInput.svelte";


  let {keyword = "", encode = true} = $props();
</script>

<MatrixInput encode={encode} keyword={keyword}/>