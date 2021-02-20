import React, { FC, useState } from 'react';

import {
  Button,
  CardDots,
  MasterCardIcon,
  ModalComponent,
  Paragrapgh,
  VisaIcon,
} from '../shared';
import { useWidth } from '../../util/useWidth';
import { ICardDetails } from '../../store/subscription/subscription.type';
import './styles.scss';

interface IOwnProps {
  onChangeCard: () => void;
  card: ICardDetails;
}

const CreditCard: FC<IOwnProps> = ({ onChangeCard, card }) => {
  const width = useWidth();
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className='w-100 plan'>
      <div className={width > 520 ? 'pb-20 line-bottom' : 'pb-24'}>
        <div className={width > 520 ? 'ml-24 mr-24' : 'ml-12 mr-12'}>
          <div className='card-type'>
            <VisaIcon />
            <MasterCardIcon />
          </div>
          <div className='card-number mb-8 mt-12 d-flex align-items-center justify-content-between'>
            <CardDots />
            <CardDots />
            <CardDots />
            <Paragrapgh
              size={2}
              color='black-3'
              align='default'
              fontWeight={500}
            >
              {card.number.slice(-4)}
            </Paragrapgh>
          </div>
          <Paragrapgh
            className='mb-24'
            size={2}
            color='black-2'
            align='default'
            fontWeight={400}
          >
            {card.holder} - Expired {card.date}
          </Paragrapgh>
          <Paragrapgh size={2} color='black-2' align='default' fontWeight={400}>
            Next billing:{' '}
            <span className='font-weight-500'>$990 on March 01, 2021</span>
          </Paragrapgh>
        </div>
      </div>
      <div className={width > 520 ? 'd-flex mt-16 ml-24' : 'pl-12 pr-12'}>
        <Button
          className={width > 520 ? 'mr-16' : 'mb-8'}
          color='blue'
          size={1}
          width={width > 520 ? 'normal' : 'wide'}
          type='bordered'
          onClick={onChangeCard}
        >
          Change card
        </Button>
        <Button
          color='blue'
          size={1}
          width={width > 520 ? 'normal' : 'wide'}
          type='transparent'
          onClick={() => setIsVisible(true)}
        >
          Remove
        </Button>
      </div>
      <ModalComponent
        visible={isVisible}
        onCancel={() => setIsVisible(false)}
        buttonText='Remove card'
        type='warning'
        title='Are you sure?'
        text='If you delete the payment method, you will not be able to renew your subscription and you will lose access to your data. Are you sure you want to delete a payment method?'
        onConfirm={() => console.log('onConfirm')}
      />
    </div>
  );
};

export default CreditCard;
