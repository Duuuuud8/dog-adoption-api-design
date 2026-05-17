const Dog = require("../models/Dog");
const User = require("../models/User");


const createDog = async (req, res) => {
    try{
        const { name, breed, description } = req.body;
        const ownerId = req.user.id;
        const newDog = await Dog.create({
            name,
            breed,
            description,
            owner: ownerId
        });
        await User.findByIdAndUpdate(
            ownerId,
            {
                $push: {
                    registeredDogs: newDog._id
                }
            }
        );
        return res.status(201).json({
            message: "Dog registered successfully",
            dog: newDog
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const viewDogs = async (req, res) => {
    const { 
            page = 1,
            limit = 10,
            isAdopted
        } = req.query;
            // sets up pagination

    try{
        const filter = {};
            // sets up for filtering
        if (isAdopted !== undefined) {
            filter.isAdopted = isAdopted === "true";
        }
            // just means "true" === "true" coverts  string to boolean to match
            // undefined means not included in url, true show dogs adopted/ false shows dogs not adopted
        const skip = (Number(page) -1) * Number(limit);
            // don't skip any pages if page is 1 etc.
        const dogs = await Dog.find(filter)
                                    // gets matching dogs
                                .skip(skip)
                                    // skips records for pagination
                                .limit(Number(limit));
                                    // restricts results shown Number(limit) converts string to number
                // Mongo query chaining
        return res.json({
            dogs
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const viewRegisteredDogs = async (req, res) => {
    const { 
            page = 1,
            limit = 10,
            isAdopted
        } = req.query;
            // sets up pagination

    try{
        const filter = { owner: req.user.id };
            // sets up for filtering
        if (isAdopted !== undefined) {
            filter.isAdopted = isAdopted === "true";
        }
            // just means "true" === "true" coverts  string to boolean to match
            // undefined means not included in url, true show dogs adopted/ false shows dogs not adopted
        const skip = (Number(page) -1) * Number(limit);
            // don't skip any pages if page is 1 etc.
        const dogs = await Dog.find(filter)
                                    // gets matching dogs
                                .skip(skip)
                                    // skips records for pagination
                                .limit(Number(limit));
                                    // restricts results shown Number(limit) converts string to number
                // Mongo query chaining
        return res.json({
            dogs
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

const viewAdoptedDogs = async (req, res) => {
    const { 
            page = 1,
            limit = 10,
            isAdopted
        } = req.query;
            // sets up pagination

    try{
        const skip = (Number(page) -1) * Number(limit);
            // don't skip any pages if page is 1 etc.
        const dogs = await Dog.find({ adoptedBy: req.user.id })
                                    // gets matching dogs
                                .skip(skip)
                                    // skips records for pagination
                                .limit(Number(limit));
                                    // restricts results shown Number(limit) converts string to number
                // Mongo query chaining
        return res.json({
            dogs
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


const adoptDog = async (req, res) => {
    try{
        const dog = await Dog.findById(req.params.id);
        if (!dog) {
            return res.status(404).json({
                error: "Dog not found"
            });
        }
        if (dog.isAdopted) {
            return res.status(400).json({
                error: "Dog is already adopted."
            });
        }
        if(dog.owner.toString() === req.user.id) {
            return res.status(400).json({
                error: "You cannot adopt your own dog."
            });
        }

        dog.isAdopted = true;
        dog.adoptedBy = req.user.id;

        const { thankYouMessage } = req.body;
        dog.thankYouMessage = thankYouMessage;

        await dog.save();
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    adoptedDogs: dog._id
                }
            }
        );

        return res.json({
            message: "Dog adopted successfully",
            dog
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


const deleteDog = async (req, res) => {
    try{
        const dog = await Dog.findById(req.params.id);
        if(!dog) {
            return res.status(404).json({
                error: "Dog not found"
            });
        }
        if (dog.owner.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You can only delete your own dogs"
            });
        }
        if (dog.isAdopted) {
            return res.status(400).json({
                error: "Adopted dogs cannot be deleted"
            });
        }
        await dog.deleteOne();
        return res.json({
            message: "Dog deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};


module.exports = {
    createDog, 
    viewDogs,
    viewRegisteredDogs,
    viewAdoptedDogs,
    adoptDog,
    deleteDog
};