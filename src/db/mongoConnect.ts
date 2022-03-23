import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.mongoURI;

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            //useFindAndModify: true,
        } as mongoose.ConnectOptions);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
