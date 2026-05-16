const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");


const { createDog, viewDogs, adoptDog, deleteDog } = require("../controllers/dogController");


router.post(
    "/",
    authMiddleware,
    createDog
);

router.get(
    "/",
    authMiddleware,
    viewDogs
);

router.patch(
    "/:id/adopt",
    authMiddleware,
    adoptDog
);

router.delete(
    "/:id/",
    authMiddleware,
    deleteDog
);


module.exports = router;