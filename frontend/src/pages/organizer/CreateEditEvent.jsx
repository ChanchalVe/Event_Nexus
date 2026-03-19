import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventApi, uploadApi } from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, Image, ArrowLeft, Globe, Building } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEditEvent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: null,
        time: '',
        location: '',
        location_type: 'offline',
        max_participants: '',
        category: '',
        banner_url: '',
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchEvent();
        }
    }, [id, isEdit]);

    const fetchCategories = async () => {
        try {
            const response = await eventApi.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchEvent = async () => {
        try {
            const response = await eventApi.getOne(id);
            const event = response.data;
            setFormData({
                title: event.title,
                description: event.description,
                date: new Date(event.date),
                time: event.time,
                location: event.location,
                location_type: event.location_type,
                max_participants: event.max_participants.toString(),
                category: event.category,
                banner_url: event.banner_url || '',
            });
        } catch (error) {
            toast.error('Failed to load event');
            navigate('/organizer/events');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const response = await uploadApi.uploadImage(file);
            setFormData({ ...formData, banner_url: response.data.url });
            toast.success('Image uploaded successfully');
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter event title');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Please enter event description');
            return;
        }
        if (!formData.date) {
            toast.error('Please select event date');
            return;
        }
        if (!formData.time) {
            toast.error('Please enter event time');
            return;
        }
        if (!formData.location.trim()) {
            toast.error('Please enter event location');
            return;
        }
        if (!formData.max_participants || parseInt(formData.max_participants) < 1) {
            toast.error('Please enter valid number of participants');
            return;
        }
        if (!formData.category) {
            toast.error('Please select event category');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                date: format(formData.date, 'yyyy-MM-dd'),
                max_participants: parseInt(formData.max_participants),
                banner_url: formData.banner_url || null,
            };

            if (isEdit) {
                await eventApi.update(id, payload);
                toast.success('Event updated successfully');
            } else {
                await eventApi.create(payload);
                toast.success('Event created successfully');
            }
            navigate('/organizer/events');
        } catch (error) {
            toast.error(error.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} event`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div data-testid={isEdit ? 'edit-event-page' : 'create-event-page'}>
            <TopNav title={isEdit ? 'Edit Event' : 'Create Event'} showSearch={false} />

            <div className="p-6 max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-4 text-slate-600"
                    onClick={() => navigate(-1)}
                    data-testid="back-btn"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                            {isEdit ? 'Edit Event Details' : 'Event Details'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Banner Image */}
                            <div className="space-y-2">
                                <Label>Event Banner (Optional)</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                                    {formData.banner_url ? (
                                        <div className="relative">
                                            <img
                                                src={formData.banner_url.startsWith('http') ? formData.banner_url : `${process.env.REACT_APP_BACKEND_URL}${formData.banner_url}`}
                                                alt="Banner preview"
                                                className="w-full h-40 object-cover rounded-lg"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => setFormData({ ...formData, banner_url: '' })}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer">
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                                    {uploading ? (
                                                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Image className="w-6 h-6 text-slate-400" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    {uploading ? 'Uploading...' : 'Click to upload banner image'}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                data-testid="banner-upload"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Enter event title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    data-testid="event-title"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your event..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    data-testid="event-description"
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                data-testid="event-date"
                                            >
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {formData.date ? format(formData.date, 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.date}
                                                onSelect={(date) => handleInputChange('date', date)}
                                                disabled={(date) => date < new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Time *</Label>
                                    <Input
                                        id="time"
                                        type="time"
                                        value={formData.time}
                                        onChange={(e) => handleInputChange('time', e.target.value)}
                                        data-testid="event-time"
                                    />
                                </div>
                            </div>

                            {/* Location Type */}
                            <div className="space-y-3">
                                <Label>Location Type *</Label>
                                <RadioGroup
                                    value={formData.location_type}
                                    onValueChange={(value) => handleInputChange('location_type', value)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value="offline" id="offline" className="peer sr-only" />
                                        <Label
                                            htmlFor="offline"
                                            className="flex flex-col items-center justify-between rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                                            data-testid="location-offline"
                                        >
                                            <Building className="mb-2 h-6 w-6 text-blue-600" />
                                            <span className="text-sm font-medium">In-Person</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="online" id="online" className="peer sr-only" />
                                        <Label
                                            htmlFor="online"
                                            className="flex flex-col items-center justify-between rounded-lg border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
                                            data-testid="location-online"
                                        >
                                            <Globe className="mb-2 h-6 w-6 text-blue-600" />
                                            <span className="text-sm font-medium">Online</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Location */}
                            <div className="space-y-2">
                                <Label htmlFor="location">
                                    {formData.location_type === 'online' ? 'Meeting Link/Platform *' : 'Venue Address *'}
                                </Label>
                                <Input
                                    id="location"
                                    placeholder={formData.location_type === 'online' ? 'e.g., Zoom, Google Meet link' : 'Enter venue address'}
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    data-testid="event-location"
                                />
                            </div>

                            {/* Category and Max Participants */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category *</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleInputChange('category', value)}
                                    >
                                        <SelectTrigger data-testid="event-category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_participants">Max Participants *</Label>
                                    <Input
                                        id="max_participants"
                                        type="number"
                                        min="1"
                                        placeholder="e.g., 100"
                                        value={formData.max_participants}
                                        onChange={(e) => handleInputChange('max_participants', e.target.value)}
                                        data-testid="event-max-participants"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/organizer/events')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                                    disabled={loading}
                                    data-testid="submit-event-btn"
                                >
                                    {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Event' : 'Create Event')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
