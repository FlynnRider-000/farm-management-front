import React from 'react';
import { Title } from '../components/shared';
import UtilsTable from '../components/farm-util/UtilsTable';
import { useWidth } from '../util/useWidth';

const Profile = () => {
  const width = useWidth();

  return (
    <>
      <div className='content pb-32'>
        {width > 768 && (
          <Title
            className='mb-24'
            size={5}
            color='black-3'
            align='default'
            fontWeight={600}
          >
            Setting
          </Title>
        )}
        <UtilsTable category='Seed' />
      </div>
    </>
  );
};

export default Profile;