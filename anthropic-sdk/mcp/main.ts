import { agent } from "./agent";
import { generateNeo4jCypher } from "./graphWriter";

async function main() {
  console.log("=== 1️⃣ List Industries ===");
  const industriesResponse = await agent.run(`
Usa lo strumento 'industries' per elencare tutte le Industry names presenti nel database companies
`);
  console.log(industriesResponse);

  console.log("\n=== 2️⃣ Companies in Industry Demo ===");
  const companiesInIndustry = await agent.run(`
Usa lo strumento 'companies_in_industry' con industry: "Technology"
`);
  console.log(companiesInIndustry);

  console.log("\n=== 3️⃣ Company Search Demo ===");
  const searchCompany = await agent.run(`
Usa lo strumento 'companies' per cercare aziende che contengono il nome "Acme"
`);
  console.log(searchCompany);

  console.log("\n=== 4️⃣ Articles in Month Demo ===");
  const articlesInMonth = await agent.run(`
Usa lo strumento 'articles_in_month' con date: "2025-01-01"
`);
  console.log(articlesInMonth);

  console.log("\n=== 5️⃣ Article Details Demo ===");
  const articleDetails = await agent.run(`
Usa lo strumento 'article' con article_id: "article123"
`);
  console.log(articleDetails);

  console.log("\n=== 6️⃣ Companies in Article Demo ===");
  const companiesInArticle = await agent.run(`
Usa lo strumento 'companies_in_articles' con article_id: "article123"
`);
  console.log(companiesInArticle);

  console.log("\n=== 7️⃣ People at Company Demo ===");
  const peopleAtCompany = await agent.run(`
Usa lo strumento 'people_at_company' con company_id: "company123"
`);
  console.log(peopleAtCompany);

  console.log("\n=== 8️⃣ Knowledge Graph Writer Demo ===");
  const text = "John Doe è CEO di Acme Corp e collabora con Jane Smith sul progetto Phoenix.";
  
  const extraction = await agent.run(`
Estrai entità e relazioni da questo testo:
"${text}"
Restituisci JSON con "entities" e "relations".
`);
  
  const graphData = JSON.parse(extraction);
  const cypher = generateNeo4jCypher(graphData);

  await agent.run(`
write_neo4j_cypher:
${cypher}
`);
  console.log("Knowledge Graph inserito con successo!");

  console.log("\n=== 9️⃣ GraphRAG Demo ===");
  const graphRagResponse = await agent.run(`
Usa il knowledge graph companies per:
1. Trovare tutte le entità collegate a John Doe
2. Per ciascuna, mostra i progetti associati
3. Restituisci la risposta in forma tabellare
`);
  console.log(graphRagResponse);

  console.log("\n=== 🔟 Chat Memory Persistente Demo ===");
  await agent.run(`
Ricorda che John Doe è CEO di Acme Corp e collabora con Jane Smith sul progetto Phoenix.
In futuro, usa queste informazioni dal grafo per rispondere a domande relative a John Doe.
`);
  
  const memoryResponse = await agent.run(`
Sto parlando di John Doe. Quali informazioni rilevanti puoi darmi?
`);
  console.log(memoryResponse);
}

main().catch(console.error);
