import React from 'react'

interface TagListProps {
  tags: string[]
}

const TagList = ({ tags }: TagListProps) => {
  return (
    <div className='flex flex-row items-start justify-start w-full pt-2 gap-2 flex-wrap'>
      {tags.map((tag, index) => (
        <div key={index} className='flex flex-row px-3 py-2 rounded-full bg-slate-100'>
          <span className='text-xs text-primary font-normal tracking-tight truncate'>
            {tag}
          </span>
        </div>
      ))}
    </div>
  )
}

export default TagList