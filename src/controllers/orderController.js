const { updateFoodRating } = require("../models/foodModels");
const {
  updateOrderRating,
  getTotalRating,
  findOrderUser,
  getAllOrder,
  createOrder,
  findOrderDetail,
} = require("../models/orderModels");

const createOrderUser = async (req, res) => {
  try {
    const uuid = req.user.uuid;
    const food_id = parseInt(req.params.food_id);
    const location = req.body.location;

    //create order
    const data = await createOrder(uuid, food_id, location);
    if (!data) {
      return res.status(400).json({ message: "data not found" });
    }

    res.status(201).json({
      data: data,
      message: "Order successfully created",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "data insert failed" });
  }
};

//untuk mendapatkan semua data order user
const getOrderUser = async (req, res) => {
  try {
    const uuid = req.user.uuid;
    const price = req.query.price;
    const date = req.query.date;
    const page = parseInt(req.query.page);

    //validation
    if (page < 1) {
      return res.status(400).json({ message: "Error : Negative pagination" });
    }
    if (price && date) {
      return res.status(400).json({ message: "accept only 1 sort parameter" });
    }

    const data = await getAllOrder(page, price, date, uuid);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findOrderDetailUser = async (req, res) => {
  try {
    const uuid = req.user?.uuid; // Pastikan `uuid` tersedia
    const id = parseInt(req.params?.id); // Ambil parameter `id`

    // Validasi `uuid`
    if (!uuid) {
      return res.status(400).json({ message: "User UUID tidak valid" });
    }

    // Validasi dan konversi `id`
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Order ID tidak valid" });
    }

    const order = await findOrderDetail(uuid, id); // Mencari pesanan berdasarkan ID

    if (!order) {
      return res.status(404).json({ message: "data not found" });
    }

    res.status(200).json({
      data: order,
    });
  } catch (error) {
    console.error("Error in findOrderDetailUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//untuk memberi nilai pada makanan setelah di order
const ratingFeature = async (req, res) => {
  try {
    const uuid = req.user.uuid;
    const id = parseInt(req.params.id);
    const rating = req.body.rating || null;
    //cek jika body request empty
    if (!rating) {
      return res.status(400).json({ message: "body request empty" });
    }
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating out of number - rate food from 1 to 5" });
    }

    //cek apakah ada data order dengan id sekian dan uuid sekian
    const isOrder = await findOrderUser(id, uuid);
    if (!isOrder) {
      return res.status(400).json({ message: "Data not found" });
    }

    //update order rating
    const data = await updateOrderRating(rating, uuid, id);

    //update food rating
    const { totalRating, totalCount } = await getTotalRating(data.food_id);
    const calculatedRating = Math.round(totalRating / totalCount);
    const foodRating = await updateFoodRating(data.food_id, calculatedRating);

    res.status(200).send({
      Data: {
        idorder: data.id,
        rated: data.rating,
        food_id: data.food_id,
        food: foodRating.name,
        food_rating: foodRating.rating,
      },
      message: "Food successfully rated",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  ratingFeature,
  getOrderUser,
  createOrderUser,
  findOrderDetailUser,
};
