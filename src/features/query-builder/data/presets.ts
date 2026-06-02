import { QueryPreset, QuerySchema } from "../types/query";
import {
  addGroupToGroup,
  addRuleToGroup,
  createDefaultQueryState,
  updateGroup,
  updateRule,
} from "../lib/query-state";

function updateChildRule(
  preset: ReturnType<typeof createDefaultQueryState>,
  index: number,
  updates: Parameters<typeof updateRule>[2],
) {
  const childId = preset.childrenByGroupId[preset.rootId]?.[index];
  return childId ? updateRule(preset, childId, updates) : preset;
}

function userPresets(schema: QuerySchema): QueryPreset[] {
  let activeAdults = createDefaultQueryState(schema);
  activeAdults = updateChildRule(activeAdults, 0, {
    field: "age",
    operator: "greater_than",
    value: 18,
  });
  activeAdults = updateChildRule(activeAdults, 1, {
    field: "country",
    operator: "equals",
    value: "Nigeria",
  });

  let loyalBuyers = createDefaultQueryState(schema);
  loyalBuyers = updateChildRule(loyalBuyers, 0, {
    field: "status",
    operator: "equals",
    value: "active",
  });
  loyalBuyers = updateChildRule(loyalBuyers, 1, {
    field: "purchases",
    operator: "greater_than",
    value: 10,
  });

  let nestedCampaign = createDefaultQueryState(schema);
  nestedCampaign = addGroupToGroup(nestedCampaign, nestedCampaign.rootId, schema, "OR");
  const nestedGroupId =
    nestedCampaign.childrenByGroupId[nestedCampaign.rootId]?.find(
      (id) => nestedCampaign.nodes[id]?.type === "group",
    ) ?? "";

  if (nestedGroupId) {
    nestedCampaign = updateGroup(nestedCampaign, nestedGroupId, { logic: "OR" });
    const nestedChildren = nestedCampaign.childrenByGroupId[nestedGroupId] ?? [];
    if (nestedChildren[0]) {
      nestedCampaign = updateRule(nestedCampaign, nestedChildren[0], {
        field: "status",
        operator: "equals",
        value: "active",
      });
    }
    nestedCampaign = addRuleToGroup(nestedCampaign, nestedGroupId, schema);
    const updatedChildren = nestedCampaign.childrenByGroupId[nestedGroupId] ?? [];
    if (updatedChildren[1]) {
      nestedCampaign = updateRule(nestedCampaign, updatedChildren[1], {
        field: "purchases",
        operator: "greater_than",
        value: 10,
      });
    }
  }

  return [
    {
      id: "active-adults",
      name: "Active adults",
      description: "Adults in Nigeria with a clear demographic filter.",
      query: activeAdults,
    },
    {
      id: "loyal-buyers",
      name: "Loyal buyers",
      description: "Active customers with more than 10 purchases.",
      query: loyalBuyers,
    },
    {
      id: "nested-campaign",
      name: "Nested campaign",
      description: "A nested AND/OR group for campaign segmentation.",
      query: nestedCampaign,
    },
  ];
}

function orderPresets(schema: QuerySchema): QueryPreset[] {
  let highValue = createDefaultQueryState(schema);
  highValue = updateChildRule(highValue, 0, {
    field: "total",
    operator: "greater_than",
    value: 150,
  });
  highValue = updateChildRule(highValue, 1, {
    field: "paid",
    operator: "equals",
    value: true,
  });

  let regional = createDefaultQueryState(schema);
  regional = updateChildRule(regional, 0, {
    field: "region",
    operator: "equals",
    value: "Africa",
  });
  regional = updateChildRule(regional, 1, {
    field: "total",
    operator: "greater_than",
    value: 100,
  });

  let dateRange = createDefaultQueryState(schema);
  dateRange = updateChildRule(dateRange, 0, {
    field: "createdAt",
    operator: "between",
    value: ["2026-01-01", "2026-12-31"],
  });
  dateRange = updateChildRule(dateRange, 1, {
    field: "paid",
    operator: "equals",
    value: true,
  });

  return [
    {
      id: "high-value-paid",
      name: "High value paid",
      description: "Paid orders above a meaningful total.",
      query: highValue,
    },
    {
      id: "regional-orders",
      name: "Regional orders",
      description: "Africa orders above a baseline value.",
      query: regional,
    },
    {
      id: "current-year-paid",
      name: "Current year paid",
      description: "Paid orders inside a date range.",
      query: dateRange,
    },
  ];
}

export function createPresetQueries(schema: QuerySchema): QueryPreset[] {
  return schema.id === "orders" ? orderPresets(schema) : userPresets(schema);
}
