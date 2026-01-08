export function generateNeo4jCypher(graphData: any) {
  const { entities, relations } = graphData;

  const entityCypher = entities.map((e: any) =>
    `MERGE (:${e.type} {name: "${e.name}"})`
  ).join("\n");

  const relationCypher = relations.map((r: any) =>
    `MATCH (a {name:"${r.from}"}),(b {name:"${r.to}"})
     MERGE (a)-[:${r.type}]->(b)`
  ).join("\n");

  return `${entityCypher}\n${relationCypher}`;
}
