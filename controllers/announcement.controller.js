import Announcement from "../mongodb/models/announcement.js";
import user from '../mongodb/models/user.js';


import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllAnnouncements = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        announcementType = "",
    } = req.query;

    const query = {};

    if (announcementType !== "") {
        query.announcementType = announcementType;
    }

    if (title_like) {
        query.title = { $regex: title_like, $options: "i" };
    }

    try {
        const count = await Announcement.countDocuments({ query });

        const announcements = await Announcement.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAnnouncementDetail = async (req, res) => {
    const { id } = req.params;
    const announcementExists = await Announcement.findOne({ _id: id }).populate(
        "creator",
    );

    if (announcementExists) {
        res.status(200).json(announcementExists);
    } else {
        res.status(404).json({ message: "Announcement not found" });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            description,
            announcementType,
            photo,
            email,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newAnnouncement = await Announcement.create({
            title,
            description,
            announcementType,
            photo: photoUrl.url,
            creator: user._id,
        });

        user.allAnnouncements.push(newAnnouncement._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Announcement created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, announcementType, photo } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Announcement.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
                announcementType,
                photo: photoUrl.url || photo,
            },
        );

        res.status(200).json({ message: "Announcement updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcementToDelete = await announcement.findById({ _id: id }).populate(
            "creator",
        );

        if (!announcementToDelete) throw new Error("Announcement not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        announcementToDelete.remove({ session });
        announcementToDelete.creator.allAnnouncements.pull(announcementToDelete);

        await announcementToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllAnnouncements,
    getAnnouncementDetail,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};
