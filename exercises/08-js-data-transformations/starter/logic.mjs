export function normalizeSearchTerm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "");
}

export function filterProducts(products, query) {
  const search = normalizeSearchTerm(query);
  if (search === "") {
    return [...products];
  }
  return products.filter((product) =>
    Object.values(product).some((value) =>
      normalizeSearchTerm(value).includes(search),
    ),
  );
}

export function sortProducts(products, criterion, direction = 'asc') {
  if (
    products.some(
      (product) =>
        product === null ||
        typeof product !== "object" ||
        !Object.hasOwn(product, criterion),
    )
  ) {
    throw new RangeError(`Criterio de ordenación desconocido: ${criterion}`);
  }
  if (direction !== "asc" && direction !== "desc") {
    throw new RangeError(`Dirección de ordenación desconocida: ${direction}`);
  }

  const factor = direction === "asc" ? 1 : -1;
  return [...products].sort((pA, pB) => {
    const valueA = pA[criterion];
    const valueB = pB[criterion];
    if (typeof valueA === "number" && typeof valueB === "number") {
      return (valueA - valueB) * factor;
    }
    return String(valueA ?? "").localeCompare(
      String(valueB ?? ""),
      "es",
      { sensitivity: "base" },
    ) * factor;
  });
}

export function groupProductsByCategory(products) {
  return products.reduce((groups, product) => {
    const cat = product.category;
    if (!Object.hasOwn(groups, cat)) {
      groups[cat] = [];
    }
    groups[cat].push(product);
    return groups;
  }, {});
}

export function summarizeInventory(products) {
  return products.reduce(
    (summary, product) => {
      summary.productCount += 1;
      summary.totalUnits += product.stock;
      summary.totalValue += product.price * product.stock;
      return summary;
    },
    { productCount: 0, totalUnits: 0, totalValue: 0 }
  );
}
