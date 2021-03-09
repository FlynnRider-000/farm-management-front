import React, { useState, useEffect, useRef, FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import { Radio, Collapse } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio';

import { hideFeedback, showFeedback } from '../../store/farms/farms.actions';
import { IMainList } from '../../types/basicComponentsTypes';
import { IRootState } from '../../store/rootReducer';
import { IFarmState } from '../../store/farms/farms.type';
import { IUtilState, IUtilData } from '../../store/utils/utils.type';
import { getUtilData } from '../../store/utils/utils.actions';
import {
  ISeasonData,
  ISeasonsData,
  ISeasonState,
} from '../../store/seasons/seasons.type';
import { getSeasonData } from '../../store/seasons/seasons.actions';
import { AuthState } from '../../store/auth/auth.type';

import { composeApi } from '../../apis/compose';
import toggleSecondMillisecond from '../../util/toggleSecondMillisecond';

import { Datepicker, Dropdown, Input, Feedback, RadioButton } from '../shared';

interface ITablesModal {
  data: any;
  onConfirm: (data: any) => void;
  trigger: boolean;
}

const SeedLineModal: FC<ITablesModal> = ({ data, onConfirm, trigger }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const initTrigger = useRef(false);

  const [isSeasonNew, setIsSeasionNew] = useState('old');
  const [newSeasonName, setNewSeasonName] = useState('');

  const allFeedback = useSelector<IRootState, IFarmState['allFeedback']>(
    state => state.farms.allFeedback,
  );

  const seedtypeData = useSelector<IRootState, IUtilState['seedtypes']>(
    state => state.utils.seedtypes,
  );

  const seasonData = useSelector<IRootState, ISeasonState['seasons']>(
    state => state.seasons.seasons,
  );

  const auth = useSelector<IRootState, AuthState['auth']>(
    state => state.auth.auth,
  );

  const [fieldData, setFieldData] = useState({
    planned_date: moment().toDate().getTime(),
    planned_date_harvest: moment().toDate().getTime(),
    seed_id: '',
    name: '',
  });

  const handleOnSelectType = (value: string): void => {
    setFieldData(prev => ({ ...prev, seed_id: value }));
  };

  const fieldValid = () => {
    if (
      (!fieldData.name && isSeasonNew === 'old') ||
      (!newSeasonName && isSeasonNew === 'new')
    ) {
      dispatch(
        showFeedback({
          isMessageModal: true,
          type: 'error',
          message: `Add name`,
        }),
      );
      return null;
    }

    if (
      Number(fieldData.planned_date) > Number(fieldData.planned_date_harvest)
    ) {
      dispatch(
        showFeedback({
          isMessageModal: true,
          type: 'error',
          message: 'Date seeded cannot be greater than date harvested',
        }),
      );
      return false;
    }

    if (!fieldData.seed_id) {
      dispatch(
        showFeedback({
          isMessageModal: true,
          type: 'error',
          message: `Add seed type`,
        }),
      );
      return null;
    }

    return true;
  };

  const onSeasonType = (e: RadioChangeEvent) => {
    setIsSeasionNew(e.target.value);
  };

  useEffect(() => {
    dispatch(getUtilData('seedtype', history));
    dispatch(getSeasonData(history));
  }, []);

  useEffect(() => {
    if (initTrigger.current) {
      const valid = fieldValid();
      if (valid) {
        const validData = {
          ...fieldData,
          planned_date: toggleSecondMillisecond(fieldData.planned_date),
          planned_date_harvest: toggleSecondMillisecond(
            fieldData.planned_date_harvest,
          ),
        };

        if (isSeasonNew === 'new') {
          composeApi(
            {
              data: {
                name: newSeasonName,
              },
              method: 'POST',
              url: 'api/season/seasons',
              requireAuth: true,
            },
            dispatch,
            auth,
            history,
          ).then(responseData => {
            if (responseData.status === 'success') {
              validData.name = responseData.id;
              onConfirm(validData);
            }
          });
        } else onConfirm(validData);
      }
    } else {
      initTrigger.current = true;
    }
  }, [trigger]);

  return (
    <div>
      {allFeedback.map((feedback: any, i: number) => {
        if (feedback.isMessageModal) {
          return (
            <Feedback
              message={feedback.message}
              type={feedback.type}
              theme='light'
              key={feedback.id}
              onClose={() => dispatch(hideFeedback(feedback.id))}
            />
          );
        }

        return '';
      })}
      <Radio.Group
        className='d-flex mt-14 mb-32'
        onChange={onSeasonType}
        value={isSeasonNew}
      >
        <RadioButton label='Existing season' value='old' />
        <RadioButton className='ml-34' label='New season' value='new' />
      </Radio.Group>
      {isSeasonNew === 'old' && (
        <Dropdown
          className='mr-16 w-100'
          placeholder='Choose Season'
          onChange={value => setFieldData(prev => ({ ...prev, name: value }))}
          label='Season name'
          options={seasonData.map(
            (season: ISeasonData) =>
              ({
                value: season.id,
                label: season.season_name,
                id: season.id,
              } as IMainList),
          )}
          defaultValue={undefined}
        />
      )}
      {isSeasonNew === 'new' && (
        <Input
          type='text'
          className='mb-16'
          value={newSeasonName}
          label='New Season'
          placeholder='season name'
          onChange={e => setNewSeasonName(e.target.value)}
        />
      )}
      <Datepicker
        className='mb-16 mt-16'
        label='Planned date seeded'
        defaultValue={fieldData.planned_date}
        onChange={e => {
          setFieldData(prev => ({
            ...prev,
            planned_date: e
              ? e!.toDate().getTime()
              : moment().toDate().getTime(),
          }));
        }}
        required
      />
      <Datepicker
        className='mb-16'
        label='Planned date harvested'
        defaultValue={fieldData?.planned_date_harvest}
        onChange={e => {
          if (
            fieldData.planned_date !== undefined &&
            e &&
            e!.toDate().getTime() < fieldData.planned_date
          ) {
            setFieldData(prev => ({
              ...prev,
              planned_date_harvest: moment().toDate().getTime(),
            }));
          } else {
            setFieldData(prev => ({
              ...prev,
              planned_date_harvest: e
                ? e!.toDate().getTime()
                : moment().toDate().getTime(),
            }));
          }
        }}
        required
      />
      <Dropdown
        className='mb-16'
        placeholder='Seed type'
        onChange={(value, event) => handleOnSelectType(value)}
        label='Seed Type'
        options={seedtypeData.map(
          (seedtype: IUtilData) =>
            ({
              value: seedtype.id,
              label: seedtype.name,
              id: seedtype.id,
            } as IMainList),
        )}
        defaultValue={fieldData.seed_id ? fieldData.seed_id : undefined}
      />
    </div>
  );
};

export default SeedLineModal;
