import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, breadcrumbs }) => {
  return (
    <div className="bg-white shadow-sm py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex space-x-2 text-sm font-medium text-gray-500 mt-1">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-gray-400">/</span>}
                {item.path ? (
                  <Link to={item.path} className="hover:text-primary-600">
                    {item.label || item}
                  </Link>
                ) : (
                  <span>{item.label || item}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
