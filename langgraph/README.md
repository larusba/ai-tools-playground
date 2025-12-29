# TODO

- [ ] test checkbox

## Checkpoint

Possiamo fare una cosa del genere https://neo4j.com/blog/developer/react-agent-langgraph-mcp/
ma invece di:
```
from langgraph.checkpoint.memory import InMemorySaver

# Create and run the agent
            agent = create_react_agent(
                "openai:gpt-4.1",  #              -> The model to use
                allowed_tools,  #                 -> The tools to use
                pre_model_hook=pre_model_hook,  # -> The function to call before the model is called
                checkpointer=InMemorySaver(),  #  -> The checkpoint to use
                prompt=SYSTEM_PROMPT,  #          -> The system prompt to use
            )
```

possiamo estendere https://reference.langchain.com/javascript/modules/_langchain_langgraph-checkpoint.html

Ad esempio, fare qualcosa di simile a redis: https://redis.io/blog/langgraph-redis-build-smarter-ai-agents-with-memory-persistence/ , https://github.com/redis-developer/langgraph-redis
https://redis.io/learn/what-is-agent-memory-example-using-lang-graph-and-redis

:
```
from langgraph.checkpoint.redis import RedisSaver

// ...
with RedisSaver.from_conn_string(REDIS_URI) as checkpointer:
    # Initialize Redis indices (only needed once)
    checkpointer.setup()
    
    # Create agent with memory
    graph = create_react_agent(model, tools=tools, checkpointer=checkpointer)

```

o a sqlite:
https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-sqlite/langgraph/checkpoint/sqlite/__init__.py


o come postgres:
https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres
https://pypi.org/project/langgraph-checkpoint-postgres/