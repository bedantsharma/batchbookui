export function computeMissingFields(parentName, child) {
  return {
    parentName: !parentName,
    childEmail: !child?.email,
  };
}

export function hasMissingFields(missing) {
  return Object.values(missing).some(Boolean);
}
