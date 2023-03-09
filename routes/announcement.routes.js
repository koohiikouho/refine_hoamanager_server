import express from 'express';

import {
    createAnnouncement,
    deleteAnnouncement,
    getAllAnnouncements,
    getAnnouncementDetail,
    updateAnnouncement,
} from '../controllers/announcement.controller.js'

const router = express.Router();

router.route('/').get(getAllAnnouncements);
router.route('/:id').get(getAnnouncementDetail);
router.route('/').post(createAnnouncement);
router.route('/:id').patch(updateAnnouncement);
router.route('/:id').delete(deleteAnnouncement);

export default router;