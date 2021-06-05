<template lang="pug">
div
  | n=
  input(v-model.number="n" type="number")
  | initial state:
  input(v-model.string="initState" type="string")
  | highlight rank:
  input(v-model.number="highlightRank" type="number")
  | hide ranks:
  input(v-model.sting="hideRanks" type="string")
  | trace-only physics:
  input(v-model.boolean="traceOnly", type="checkbox")
div
  textarea.enc(v-model.string="encoding" type="string")
div
  | {{ sequence || "&nbsp;" }}
div
  | unique permutation count: {{ permCount }}
  | length: {{ sequence.length }}
  | encoder state: {{ internalState.join("") }}
div
  | {{ info || "&nbsp;" }}
div.network(ref="netDiv")
</template>

<script lang="ts">
import { ref, defineComponent, Ref, onMounted, watch, computed } from "vue";
import { DataSet } from "vis-data";
import { Network } from "vis-network";
import {
  createVisData,
  renameInitState,
  relabelSequence,
} from "./components/superm";
export default defineComponent({
  setup: () => {
    // visJs setup
    const data = {
      nodes: new DataSet([] as any[]),
      edges: new DataSet([] as any[]),
    };
    let network: Network;
    const netDiv = ref() as Ref<HTMLDivElement>;

    // user inputs
    const hideRanks = ref("2,3");
    const traceOnly = ref(true);
    const n = ref(5);
    const initState = ref("01234");
    const highlightRank = ref(1);
    const encoding = ref(
      "000000100000100000100010000010000010000010010001000001000001000002100000100000100000100000210000010000010000010001001000001000001000001000100000100000100"
    );
    const sequence = ref("");
    // count of all unique length n subsequences
    const permCount = computed(() => {
      let seen = new Set();
      for (let i = n.value; i <= sequence.value.length; i++) {
        const cand = sequence.value.slice(i - n.value, i);
        if (new Set(cand).size === n.value) seen.add(cand);
      }
      return seen.size;
    });

    const internalState = ref([0, 1, 2, 3]);
    let old_n = n.value;
    const updateNet = () => {
      // get updated data
      let { nodes, edges, decoded, state } = createVisData(
        n.value,
        Array.from(encoding.value).map((x) => parseInt(x)),
        highlightRank.value,
        !traceOnly.value,
        hideRanks.value.split(",").map((x) => parseInt(x))
      );
      // relabel nodes and sequence based on initial state
      let init: any[] = initState.value.split("");
      if (init.length !== n.value) init = [...Array(n.value).keys()];
      nodes = renameInitState(nodes, init);
      sequence.value = relabelSequence(decoded, init);
      // update internal state
      internalState.value = state;
      if (old_n !== n.value) {
        // remove old nodes on change of dimension
        data.nodes.clear();
        data.edges.clear();
        old_n = n.value;
      }
      // update all nodes and edges
      network.storePositions();
      data.nodes.update(nodes);
      data.edges.update(edges);
    };

    watch(
      [n, encoding, highlightRank, traceOnly, hideRanks, initState],
      updateNet
    );

    const info = ref("")
    const onSelect = ({edges}: any)=>{
      if (edges.length===1)
        info.value = (data.edges.get(edges[0]) as any)?.title
      else info.value = ""
    }
    onMounted(() => {
      network = new Network(netDiv.value, data, {
        autoResize: true,
        edges: { arrows: { to: { enabled: true } } },
        height: "800",
        configure: { filter: "physics" },
      });
      network.on('click', onSelect);
      updateNet();
    });

    return {
      data,
      n,
      netDiv,
      encoding,
      sequence,
      permCount,
      internalState,
      highlightRank,
      hideRanks,
      traceOnly,
      initState,info
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.enc {
  width: 95%;
}
</style>
