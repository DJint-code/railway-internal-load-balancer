# railway-internal-load-balancer

If you're using an internal railway service with multiple replicas, then you might have noticed that internal incoming traffic isn't always spread out across all replicas.

This load-balancer solves that issue by routing all traffic to this load balancer instead of the target service, and it will spread the requests to all replicas (Using Round-robin).

The only thing you need to configure is the `TARGET` environment variable to the internal hostname of the target service, so for example if your target's hostname is `process-ocr` then specify `TARGET=process-ocr`. And of course don't forget to route the original traffic to this load balancer instead of the original target host.