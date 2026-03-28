# Trust Score Engine Specification

**Product Name:** PG Trust  
**Document Purpose:** Define the specific arithmetic algorithms, component weights, edge cases, and behavior of the PG Trust Score calculation system.

---

## 1. Trust Score Fundamentals

The Trust Score acts as a quantitative metric for tenant reliability, operating exactly like a generic financial credit score but scoped to the rental ecosystem.

**Score Boundaries:**
- **Minimum Possible Score:** 300 (Highest Risk / Severely Poor Conduct)
- **Maximum Possible Score:** 900 (Lowest Risk / Excellent Conduct)
- **Default Onboarding Score:** 500 (Neutral starting point post-verification)

---

## 2. Evaluation Components & Weightings

The final Trust Score is a weighted aggregate of four core components. Every time an evaluation takes place (e.g., Owner submits feedback), the tenant is scored out of 100 on each component.

### 2.1 Component Table
| Component Designation | Weight | Description |
| :--- | :--- | :--- |
| **Payment History** | 40% (0.40) | Discipline in paying rent on or before the due date. |
| **Behavior Rating** | 25% (0.25) | General conduct, noise complaints, and adherence to house rules. |
| **Property Condition** | 20% (0.20) | Care taken to avoid damage to furniture and PG infrastructure. |
| **Stability Factor** | 15% (0.15) | Measures tenure longevity. Longer stays imply higher stability. |

---

## 3. Calculation Algorithm

### 3.1 Raw Score Calculation (0 - 100 Scale)
For every completed stay, the owner submits ratings bounded from `0` to `100` for the four factors.
The specific instance Raw Score (`S_raw`) is computed as:

`S_raw = (0.40 * Payment_Score) + (0.25 * Behavior_Score) + (0.20 * Property_Score) + (0.15 * Stability_Score)`

### 3.2 Global Averaging (S_global)
A tenant may stay at multiple PGs over time. Their global raw score is a moving average.
To reward recent behavior more heavily, we apply an **Exponential Moving Average (EMA)** or a simple weighted recent-history average. For the V1 MVP, we will use a **Simple Moving Average (SMA)** of all historic `S_raw` values.

`S_global = SUM(S_raw_1, S_raw_2, ... S_raw_N) / N`

### 3.3 Scaling to the Trust Range (300 - 900)
Once the `S_global` (which is a percentage 0-100) is determined, it is mapped to the 300-900 scale.
The scale has a total span of `600` points (900 - 300 = 600).

**Scaling Formula:**
`Final_Trust_Score = 300 + (S_global * 6.0)`

*Example Calculation:*
- Tenant completes a stay.
- Owner gives: Payment (90/100), Behavior (80/100), Property (85/100), Stability (100/100).
- `S_raw = (0.40 * 90) + (0.25 * 80) + (0.20 * 85) + (0.15 * 100)`
- `S_raw = 36 + 20 + 17 + 15 = 88`
- Assuming this is their only stay, `S_global = 88`.
- `Final_Trust_Score = 300 + (88 * 6.0) = 300 + 528 = 828`.

---

## 4. Score Tiers & Interpretation Matrix

This is the standard rubric PG Owners use to interpret the score.

| Score Range | Classification | Owner Recommendation |
| :--- | :--- | :--- |
| **750 – 900** | **Excellent** | Accept immediately. Minimal deposit required. |
| **650 – 749** | **Good** | Safe to accept. Standard background terms. |
| **500 – 649** | **Average** | Acceptable, but review historic feedback notes carefully. |
| **300 – 499** | **Risky** | High chance of default or conflict. Rejection advised or require heavy deposit. |

---

## 5. Triggers & Edge Cases

### 5.1 Update Triggers
The score calculation service is invoked exactly when:
1. `POST /feedback/submit` is executed by a landlord.
2. In the future: An automated payment gateway flags a missed/bounced payment (updates Payment History proactively).

### 5.2 Zero-History Edge Case
A completely new tenant who has just undergone KYC verification has no data. 
- **Action:** System injects a dummy `S_global` of `33.33` to force the `Final_Trust_Score` to mathematically equal **500**.
- **UI Treatment:** Displayed as "500 (Unrated)".

### 5.3 Dispute Penalties
If a tenant abandons a PG or commits severe property damage:
- The owner can submit an "Emergency Red Flag" feedback, zeroing out all variables.
- `S_raw = 0` drops the overall average aggressively, tanking the score closer to 300.
