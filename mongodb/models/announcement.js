import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true},
    description: { type: String, required: true},
    announcementType: { type: String, required: true},
    photo: { type: String, required: true},
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},

})


const announcementModel = mongoose.model('Announcement', AnnouncementSchema);

export default announcementModel;