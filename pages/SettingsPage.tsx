import { MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { Icon, Pressable, Text, Column, Row, Heading, Modal, FormControl, Input, Button, useToast } from 'native-base';
import { useEffect, useState, ReactNode } from 'react';

import { WithLoading } from '../components';
import { CONFIG_CONSTANTS, SOURCE_CONSTANTS } from '../constants';
import { useSource, useConfig } from '../hooks';
import { Config, Source } from '../modals';
import { ConfigProvider, SourceProvider } from '../providers';

const configProvider = ConfigProvider.getProvider();
const sourceProvider = SourceProvider.getProvider();

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [showEditResourceServerUrl, setShowEditResourceServerUrl] = useState(false);
  const [showEditConcurrencyNumber, setShowEditConcurrencyNumber] = useState(false);
  const { serverUrl, concurrencyNumber, setServerUrl, setConcurrencyNumber } = useConfig();
  const { needReSync, setById, setList, setNeedReSync } = useSource();
  const toast = useToast();

  useEffect(() => {
    const init = async () => {
      const [serverConfig] = await configProvider.read(`${CONFIG_CONSTANTS.FIELDS.NAME} = ?`, ['resouce-server-url']);
      setServerUrl(Config.fromMap(serverConfig));
      const [concurrencyNumberConfig] = await configProvider.read(`${CONFIG_CONSTANTS.FIELDS.NAME} = ?`, [
        'concurrency-request-number',
      ]);
      setConcurrencyNumber(Config.fromMap(concurrencyNumberConfig));
    };

    init();
  }, []);

  useEffect(() => {
    /**
     * 同步资源
     */
    const syncSources = async () => {
      setLoading(true);
      try {
        if (serverUrl) {
          const res = await axios.get(`${serverUrl.value}/api/sources/enabled`, { timeout: 5000 });
          if (res.status === 200) {
            const sources = await sourceProvider.read(`${SOURCE_CONSTANTS.FIELDS.RESOURCE_SERVER_URL} = ?`, [
              serverUrl.value,
            ]);
            const objectIds = sources.map(source => source.objectId);
            // 存在的修改，不存在的新增
            await Promise.all(
              res.data.map(async (item: any) => {
                const idx = objectIds.indexOf(item.objectId);
                if (idx !== -1) {
                  await sourceProvider.update(Source.fromMap({ ...sources[idx], ...item }));
                } else {
                  await sourceProvider.create(
                    Source.fromMap({ ...item, resourceServerUrl: serverUrl.value, isEnabled: 1 })
                  );
                }
              })
            );
            toast.show({ description: '同步成功' });

            const rows = await sourceProvider.read();
            setById({
              ...rows.reduce((byId, item) => {
                byId[item[SOURCE_CONSTANTS.IDENTIFIER]] = Source.fromMap(item);
                return byId;
              }, {}),
            });
            setList(rows.map(item => item[SOURCE_CONSTANTS.IDENTIFIER]));
            setNeedReSync(false);
          }
        }
      } catch {
        toast.show({ description: '同步失败' });
      }
      setLoading(false);
    };

    if (needReSync) {
      syncSources();
    }
  }, [needReSync, serverUrl]);

  const onServerUrlSavePress = async (value: string) => {
    setShowEditResourceServerUrl(false);
    if (value !== serverUrl?.value) {
      setLoading(true);
      try {
        const res = await axios.get(`${value}/api/sources/enabled`, { timeout: 5000 });
        if (res.status === 200) {
          const config = Config.fromMap({ ...serverUrl?.toMap(), value });
          await configProvider.update(config);
          setServerUrl(config);
          toast.show({ description: '服务地址修改成功' });
        }
      } catch {
        toast.show({ description: '服务地址修改失败' });
      }
      setLoading(false);
    }
  };

  const onConcurrencyNumberSavePress = async (value: string) => {
    setShowEditConcurrencyNumber(false);
    if (value !== concurrencyNumber?.value) {
      const config = Config.fromMap({ ...concurrencyNumber?.toMap(), value });
      await configProvider.update(config);
      setConcurrencyNumber(config);
    }
  };

  return (
    <WithLoading loading={loading}>
      <Column>
        <Item
          title={'服务地址'}
          description={serverUrl?.value ?? 'loading...'}
          icon={<MaterialCommunityIcons name="web" />}
          onPress={() => setShowEditResourceServerUrl(true)}
        />
        <Item
          title={'同步资源'}
          description={'从服务端同步可用的资源网站'}
          icon={<MaterialCommunityIcons name="cloud-sync-outline" />}
          onPress={() => setNeedReSync(true)}
        />
        <Item
          title={'请求并发数量'}
          description={'数量较大时将导致系统卡顿'}
          icon={<Entypo name="network" size={24} color="black" />}
          onPress={() => setShowEditConcurrencyNumber(true)}
        />
      </Column>
      <EditInputModal
        show={showEditResourceServerUrl}
        label="服务地址"
        placeholder="配置后端服务地址"
        initialValue={serverUrl?.value ?? ''}
        onSave={onServerUrlSavePress}
        onCancel={() => setShowEditResourceServerUrl(false)}
      />
      <EditInputModal
        show={showEditConcurrencyNumber}
        label="请求并发数量"
        placeholder="配置请求并发数量(数量较大时将导致系统卡顿)"
        initialValue={concurrencyNumber?.value ?? ''}
        isNumberInput={true}
        onSave={onConcurrencyNumberSavePress}
        onCancel={() => setShowEditConcurrencyNumber(false)}
      />
    </WithLoading>
  );
}

const Item = ({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress}>
    {({ isPressed }) => (
      <Row className={`h-16 items-center ${isPressed && 'bg-gray-200'}`}>
        <Icon as={icon} size="xl" className="text-pink-800 mx-4" />
        <Column className="h-12 justify-around">
          <Heading size="sm">{title}</Heading>
          <Text className="text-gray-600">{description}</Text>
        </Column>
      </Row>
    )}
  </Pressable>
);

const EditInputModal = ({
  show,
  label,
  placeholder,
  initialValue,
  isNumberInput = false,
  onSave,
  onCancel,
}: {
  show: boolean;
  label: string;
  placeholder: string;
  initialValue: string;
  isNumberInput?: boolean;
  onSave: (value: string) => void;
  onCancel: () => void;
}) => {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => setValue(initialValue), [initialValue]);

  return (
    <Modal isOpen={show} onClose={onCancel}>
      <Modal.Content>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>{label}</FormControl.Label>
            <Input
              variant="underlined"
              placeholder={placeholder}
              value={value}
              keyboardType={isNumberInput ? 'numeric' : 'default'}
              onChangeText={v => setValue(isNumberInput ? v.replace(/[^0-9]/g, '') : v)}
            />
          </FormControl>
          <Button.Group className="mt-2 justify-end">
            <Button variant="ghost" colorScheme="blueGray" size="sm" onPress={onCancel}>
              取消
            </Button>
            <Button variant="ghost" size="sm" onPress={() => onSave(value)}>
              保存
            </Button>
          </Button.Group>
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
};
