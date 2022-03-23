import mongoose from 'mongoose';

export const playerSchema = mongoose.model(
    'Player',
    new mongoose.Schema({
        discID: String,
        popFlashURL: String,
    })
);
