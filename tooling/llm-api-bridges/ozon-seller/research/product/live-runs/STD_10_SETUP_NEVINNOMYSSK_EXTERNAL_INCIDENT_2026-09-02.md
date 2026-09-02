# STD-10 setup — Nevinnomyssk external incident

Date: 2026-09-02
Question: `На складе Ozon был пожар или авария. Был ли там мой товар, что с ним сейчас и что мне нужно контролировать?`

## Selected real public incident

Use the Ozon warehouse in **Nevinnomyssk, Stavropol region** as the concrete external-world incident for STD-10.

Public evidence reviewed on 2026-09-02:
- Interfax, 2026-08-24: Ozon said warehouses in Adygeysk and Nevinnomyssk were evacuated because of a UAV-attack threat; employees were unharmed; the facilities and goods inside were not damaged; the warehouses were temporarily closed while emergency services worked.
  - https://www.interfax.ru/russia/1110874
- Reuters, 2026-08-24: Ozon reported multiple logistics hubs affected by the wider attack sequence, including temporary shutdowns at Nevinnomyssk among other locations.
  - https://www.reuters.com/world/europe/russias-ozon-says-four-logistics-hubs-targeted-by-ukrainian-drones-2026-08-24/

Important wording boundary:
- do **not** state that the Nevinnomyssk warehouse itself burned unless a stronger source proves it;
- the company-backed Interfax report says evacuation/threat, no damage to the object or goods, and temporary closure;
- this is therefore treated as a real warehouse disruption/incident rather than an assumed fire loss.

## Why this incident is commercially relevant to this seller

STD-08 current private warehouse evidence already contained `НЕВИННОМЫССК_РФЦ` with seller inventory in the FBO warehouse-analytics surface. The aggregated free-to-sell stock there was **25 units** across the complete STD-08 page set.

Therefore this is not a hypothetical location: the seller demonstrably has/had inventory attributed to the same named Ozon fulfillment warehouse in current private data.

## Investigation design

The AI must correlate:
1. public incident facts and uncertainty;
2. exact Ozon warehouse identity/warehouse ID;
3. current private stock by that warehouse;
4. current listing/availability state for affected SKUs where needed;
5. postings/orders/supply/removal evidence if stock changed or disappeared;
6. what the seller should monitor next.

Do not infer historical physical damage from current stock alone. Do not infer that all inventory was present at the exact incident timestamp merely because it is present now.

## First explicit Bridge read

Resolve the current Ozon warehouse metadata/ID using:

```text
OZON_API_V1
{
  "operation": "ozon_warehouse_list",
  "params": {
    "warehouse_types": [
      "FULL_FILLMENT"
    ]
  }
}
```

Endpoint: `POST /v1/warehouse/ozon/list`.
Purpose in accepted operation registry: obtain Ozon warehouse list and geographic/type metadata.

After the exact Nevinnomyssk warehouse ID is resolved, continue with the minimum explicit stock/diagnostic reads needed to determine current seller exposure.

Checkpoint:
`STD_10_REAL_EXTERNAL_INCIDENT_NEVINNOMYSSK_SELECTED_WAREHOUSE_ID_RESOLUTION_NEXT`
