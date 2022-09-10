import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        where: {
          id: entity.id,
        },
      }
    );
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: ["items"],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const items = orderModel.items;

    const item = new OrderItem(
      items[0].id,
      items[0].name,
      items[0].price,
      items[0].product_id,
      items[0].quantity
    );

    const order = new Order(id, orderModel.customer_id, [item]);
    return order;
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll();

    const orders = orderModels.map((orderModels) => {
      const items = orderModels.items;
      const item1 = new OrderItem(
        items[0].id,
        items[0].name,
        items[0].price,
        items[0].product_id,
        items[0].quantity
      );
      const item2 = new OrderItem(
        items[1].id,
        items[1].name,
        items[1].price,
        items[1].product_id,
        items[1].quantity
      );
      const order = new Order(orderModels.id, orderModels.customer_id,[item1, item2]);
      return order;
    });

    return orders;
  }
}
