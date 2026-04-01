import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'influencer';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'manager', 'influencer'], default: 'manager' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

// ContentPlan Schema
export interface IContentPlan extends Document {
  title: string;
  rawText: string;
  generatedPlan: string;
  status: 'pending' | 'approved' | 'rejected';
  assets: {
    type: 'text' | 'image';
    content: string;
  }[];
  createdBy: mongoose.Types.ObjectId;
}

const ContentPlanSchema: Schema = new Schema({
  title: { type: String, required: true },
  rawText: { type: String, required: true },
  generatedPlan: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  assets: [{
    type: { type: String, enum: ['text', 'image'] },
    content: { type: String }
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

export const ContentPlan = mongoose.model<IContentPlan>('ContentPlan', ContentPlanSchema);

// Lead Schema
export interface ILead extends Document {
  name: string;
  phone: string;
  source: string;
  status: 'cold' | 'warm' | 'hot' | 'appointment';
  messages: {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
  }[];
}

const LeadSchema: Schema = new Schema({
  name: { type: String },
  phone: { type: String, required: true },
  source: { type: String },
  status: { type: String, enum: ['cold', 'warm', 'hot', 'appointment'], default: 'cold' },
  messages: [{
    sender: { type: String, enum: ['user', 'ai'] },
    text: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
});

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

// PromoCode Schema
export interface IPromoCode extends Document {
  code: string;
  influencer: mongoose.Types.ObjectId;
  discount: number;
  conversions: number;
  revenue: number;
}

const PromoCodeSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  influencer: { type: Schema.Types.ObjectId, ref: 'User' },
  discount: { type: Number, default: 10 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 }
});

export const PromoCode = mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

// Analytics Schema
export interface IAnalytics extends Document {
  date: Date;
  leadsCount: number;
  conversions: number;
  revenue: number;
  platform: 'telegram' | 'instagram' | 'facebook';
}

const AnalyticsSchema: Schema = new Schema({
  date: { type: Date, default: Date.now },
  leadsCount: { type: Number, default: 0 },
  conversions: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  platform: { type: String, enum: ['telegram', 'instagram', 'facebook'] }
});

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
