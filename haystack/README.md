# Haystack

Source code: https://github.com/prosto/neo4j-haystack

- [ ] the readme.md is not working correctly, update it
- [ ] Hybrid search
- [ ] Metadata prefix
- [ ] custom node label (supported with the store but not with the retriever)
- [ ] custom metadata
- [ ] Text2Cypher: could be used neo4j-graphrag-python package instead
- [ ] GraphRAG concept: could be used neo4j-graphrag-python package instead
- [ ] Chat memory: could be used neo4j-graphrag-python package instead
- [ ] Knowledge Graph Construction: could be used neo4j-graphrag-python package instead (https://neo4j.com/docs/neo4j-graphrag-python/current/user_guide_rag.html#text2cypher-retriever-user-guide)


Implemented:

- [x] basic store and retriever classes
- [x] metadata filter
- [x] custom embedding property and dimension
- [x] custom index name
- [x] similarity type (cosine or euclidean