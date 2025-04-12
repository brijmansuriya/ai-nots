import React from 'react';

interface Tag {
    id: number;
    name: string;
    description?: string;
}

interface TagShowProps {
    tag: Tag;
}

const TagShow: React.FC<TagShowProps> = ({ tag }) => {
    return (
        <div className="tag-show-page">
            <h1 className="text-2xl font-bold">Tag Details</h1>
            <div className="mt-4">
                <p>
                    <strong>ID:</strong> {tag.id}
                </p>
                <p>
                    <strong>Name:</strong> {tag.name}
                </p>
                {tag.description && (
                    <p>
                        <strong>Description:</strong> {tag.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default TagShow;