import React from 'react';
import { ProjectMember } from '../types/project';
import { UserPlus } from 'lucide-react';

interface TeamMembersListProps {
  members: ProjectMember[];
  onAddMember?: () => void;
  onRemoveMember?: (memberId: number) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  members,
  onAddMember,
  onRemoveMember,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
        {onAddMember && (
          <button
            onClick={onAddMember}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add Member
          </button>
        )}
      </div>
      
      <div className="divide-y divide-gray-200">
        {members.map((member) => (
          <div key={member.id} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {member.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{member.userName}</p>
                <p className="text-sm text-gray-500">{member.userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${member.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
              {onRemoveMember && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No team members yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMembersList;