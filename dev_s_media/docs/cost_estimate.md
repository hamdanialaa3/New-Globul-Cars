# 💰 Monthly Cost & Capacity Estimate (Production)

| Resource | Spec / Tier | Estimated Cost | Notes |
| :--- | :--- | :--- | :--- |
| **Compute (LLM Host)** | GPU Instance (T4 or A10) | ~$150 - $300 / mo | Can be optimized with "Spot Instances" or On-Demand wake-up. |
| **Compute (Worker/API)** | 2x vCPU, 4GB RAM (Node) | ~$40 / mo | Hosting Publisher + Worker + Admin UI. |
| **Database** | Managed Postgres (10GB) | ~$30 / mo | Storing post metadata and logs. |
| **Queue (Redis)** | Managed Redis (High Avail) | ~$20 / mo | Critical for Queue reliability. |
| **Storage (Images/Vid)** | S3 / GCS (100GB + Egress) | ~$15 / mo | Storing generated videos and processed images. |
| **Total Infrastructure** | **Estimated** | **~$255 - $405 / mo** | *Can run on local h/w for $0 + electricity.* |

## Scaling Triggers (Autoscaling)
- **Scale Up:** If `Queue Depth > 100` for > 5 mins -> Add Worker Instance.
- **Scale Down:** If `Queue Depth == 0` for > 30 mins -> Shutdown LLM Instance (store cold).

## Optimization Opportunities
- **Caching:** Cache LLM responses for similar cars (Save ~20% compute).
- **Batching:** Process images in batches of 10.
- **Off-Peak:** Run video generation at night (cheaper compute).
