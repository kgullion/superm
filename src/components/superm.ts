import { combinations, permutations } from "./combinatorics";

export function* all_twist_cycles(
  n: number,
  r: number
): Generator<number[][], void, unknown> {
  const elems = [...Array(n).keys()];
  for (const prefix of combinations(elems, r)) {
    const [mid, ...postfix] = elems.filter((x) => prefix.indexOf(x) === -1);
    for (const pre of permutations(prefix)) {
      for (const post of permutations(postfix)) {
        let cycle = [] as number[][];
        let rotation = [mid, ...post];
        for (let i = 0; i < rotation.length; ++i) {
          cycle.push([...pre, ...rotation]);
          rotation.push(rotation.shift()!);
        }
        yield cycle;
      }
    }
  }
}

// colors from https://en.wikipedia.org/wiki/Help:Distinguishable_colors
const colors = [
  "#F0A3FF",
  "#0075DC",
  "#993F00",
  "#4C005C",
  "#191919",
  "#005C31",
  "#2BCE48",
  "#FFCC99",
  "#808080",
  "#94FFB5",
  "#8F7C00",
  "#9DCC00",
  "#C20088",
  "#003380",
  "#FFA405",
  "#FFA8BB",
  "#426600",
  "#FF0010",
  "#5EF1F2",
  "#00998F",
  "#E0FF66",
  "#740AFF",
  "#990000",
  "#FFFF80",
  "#FFFF00",
  "#FF5005",
];
export function createVisData(
  n: number,
  encoding: number[],
  highlightRank: number,
  physics: boolean,
  hideRanks: number[]
) {
  // coerce highlightRank to int
  highlightRank |= 0;
  // create initial graph with no trace
  let nodes = new Map();
  let edges = new Map();
  let c = 0; // color index
  for (let rank = 0; rank < n - 1; ++rank) {
    for (let twist_cycle of all_twist_cycles(n, rank)) {
      for (let i = 0; i < twist_cycle.length; ++i) {
        const j = (i + 1) % twist_cycle.length;
        const node_i = twist_cycle[i].join("");
        const node_j = twist_cycle[j].join("");
        edges.set(node_i + node_j, {
          id: node_i + node_j,
          from: node_i,
          to: node_j,
          title: node_i + "→" + node_j + " rank " + rank,
          color: colors[rank % colors.length],
          width: 0.1,
          physics,
          smooth: false,
          hidden: hideRanks.includes(rank),
        });
        if (rank === highlightRank)
          nodes.set(node_i, {
            id: node_i,
            label: node_i,
            borderWidth: 0,
            opacity: 0.5,
            color: colors[c % colors.length],
            mass: 1,
            dashes: false,
            shape: "ellipse",
            shadow: false
          });
      }
      if (rank === highlightRank) ++c; // inc color index
    }
  }

  // decode and update trace edges / nodes
  let d = [...Array(n).keys()];
  let from = [...d];
  let last_n = [];
  let seen = new Set();
  let decoded = "";
  for (let i = 0; i < encoding.length; ++i) {
    const rank = encoding[i];
    d.push(...d.splice(rank, 1));
    let edge = edges.get(from.join("") + d.join(""));
    if (edge !== undefined) {
      edge.width = 6;
      edge.length = 100;
      edge.title += " ord " + i;
      edge.physics = true;
      edge.hidden = false;
    } else
      return {
        nodes: [],
        edges: [],
        decoded: "no rank " + rank + "edges",
        state: d,
      };
    let node = nodes.get(d.join(""));
    if (node !== undefined) {
      node.borderWidth = 2;
      if (last_n.length == n) last_n.shift();
      last_n.push(d[n - 1]);
      if (new Set(last_n).size === n) {
        node.opacity = 0.8;
        if (seen.has(last_n.join(""))) {
          node.shape = "database";
        } else {
          seen.add(last_n.join(""));
          node.shape = "circle";
        }
      }
      node.mass = 1;
    } else
      return {
        nodes: [],
        edges: [],
        decoded: "node " + from.join("") + " not found",
        state: d,
      };
    from = [...d];
    decoded += d[n - 1];
  }
  // make last node a bit different
  let node = nodes.get(d.join(""));
  console.log(node)
  node.borderWidth = 3;
  node.mass = 2;
  node.shadow = true
  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
    decoded,
    state: d,
  };
}

export function relabelSequence(seq: string, labels: any[]) {
  return Array.from(seq)
    .map((i) => labels[parseInt(i)])
    .join("");
}
export function renameInitState(nodes: any[], initState: any[]) {
  return nodes.map(({ label, ...node }: any) => ({
    ...node,
    label: relabelSequence(label, initState),
  }));
}
