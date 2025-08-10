import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl text-heading mb-4">404</h1>
      <h2 className="text-2xl text-subheading mb-4">Page Not Found</h2>
      <p className="text-body-text">The page you're looking for doesn't exist.</p>
    </div>
  );
};

export default NotFoundPage;
