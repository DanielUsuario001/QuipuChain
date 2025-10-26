Avoid long running tRPC queries/mutations whenever possible. If you're kicking off long running tasks using tRPC, use a mutation to kick off the task and then a polling query to check its status.

Avoid streaming queries/subscriptions unless absolutely needed -- prefer polling whenever possible. It's tricky to get streaming/subscriptions working properly, but the short-running mutation & query patterns are simple to reason about and more likely to work properly.
