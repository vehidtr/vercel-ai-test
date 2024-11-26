import React from 'react';
import { GitIcon } from './icons';

const GithubCard = ({ repo }) => {
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-4 bg-sidebar border rounded-lg shadow-md w-full hover:bg-background relative"
    >
      <div className="w-full flex justify-end opacity-70 absolute right-4 fill-blue-500 invert dark:invert-0">
        <GitIcon />
      </div>
      <h3 className="text-lg font-bold text-blue-600 w-full hover:underline">
        {repo.name}
      </h3>
      <p className="text-sidebar-accent-foreground">
        {repo.description || 'No description provided.'}
      </p>
      <div className="mt-2 flex space-x-4 text-sm text-sidebar-accent-foreground">
        <span>⭐ {repo.stargazers_count} stars</span>
        <span>🍴 {repo.forks_count} forks</span>
        <span>📂 {repo.language}</span>
      </div>
    </a>
  );
};

export default GithubCard;
