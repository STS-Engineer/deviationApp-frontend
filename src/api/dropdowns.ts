import { api } from "./client";

export type UserOption = {
  name: string;
  email: string;
};

export async function getProductLines() {
  const res = await api.get("/dropdowns/product-lines");
  return res.data.product_lines;
}

export async function getPlants() {
  const res = await api.get("/dropdowns/plants");
  return res.data.plants;
}

export async function getCustomers() {
  const res = await api.get("/dropdowns/customers");
  return res.data.customers;
}

export async function getPLUsers() {
  const res = await api.get("/auth/users/PL");
  return res.data as UserOption[];
}

export async function getVPUsers() {
  const res = await api.get("/auth/users/VP");
  return res.data as UserOption[];
}

export async function getDropdowns() {
  try {
    const [productLines, plants, customers] = await Promise.all([
      getProductLines(),
      getPlants(),
      getCustomers(),
    ]);
    return {
      product_lines: productLines,
      plants,
      customers,
    };
  } catch (err) {
    console.error("Failed to fetch dropdowns:", err);
    return {
      product_lines: [],
      plants: [],
      customers: [],
    };
  }
}
