import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Icon, Pressable, Text, Column, Row, Heading, Modal, FormControl, Input, Button, useToast } from 'native-base';
import { useEffect, useState, ReactNode } from 'react';

import { WithLoading } from '../components';
import { CONFIG_CONSTANTS, SOURCE_CONSTANTS } from '../constants';
import { useSource } from '../hooks';
import { Config, Source } from '../modals';
import { ConfigProvider, SourceProvider } from '../providers';

const configProvider = ConfigProvider.getProvider();
const sourceProvider = SourceProvider.getProvider();

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [serverConfig, setServerConfig] = useState<Config | null>(null);
  const [editResourceServerUrl, setEditResourceServerUrl] = useState<string>('');
  const [showEditResourceServerUrl, setShowEditResourceServerUrl] = useState(false);
  const { needReSync, setById, setList, setNeedReSync } = useSource();
  const toast = useToast();

  useEffect(() => {
    const init = async () => {
      const [row] = await configProvider.read(`${CONFIG_CONSTANTS.FIELDS.NAME} = ?`, ['resouce-server-url']);
      setServerConfig(Config.fromMap(row));
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
        if (serverConfig) {
          const res = await axios.get(`${serverConfig.value}/api/sources/enabled`, { timeout: 5000 });
          if (res.status === 200) {
            const sources = await sourceProvider.read(`${SOURCE_CONSTANTS.FIELDS.RESOURCE_SERVER_URL} = ?`, [
              serverConfig.value,
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
                    Source.fromMap({ ...item, resourceServerUrl: serverConfig.value, isEnabled: 1 })
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
  }, [needReSync, serverConfig]);

  const onResourceServerPress = () => {
    setEditResourceServerUrl(serverConfig?.value ?? '');
    setShowEditResourceServerUrl(true);
  };

  const onSavePress = async () => {
    setShowEditResourceServerUrl(false);
    if (editResourceServerUrl !== serverConfig?.value) {
      setLoading(true);
      try {
        const res = await axios.get(`${editResourceServerUrl}/api/sources/enabled`, { timeout: 5000 });
        if (res.status === 200) {
          const config = Config.fromMap({ ...serverConfig?.toMap(), value: editResourceServerUrl });
          await configProvider.update(config);
          setServerConfig(config);
          toast.show({ description: '服务地址修改成功' });
        }
      } catch {
        toast.show({ description: '服务地址修改失败' });
      }
      setLoading(false);
    }
  };

  return (
    <WithLoading loading={loading}>
      <Column>
        <Item
          title={'服务地址'}
          description={`${serverConfig?.value ?? 'loading...'}`}
          icon={<MaterialCommunityIcons name="web" />}
          onPress={onResourceServerPress}
        />
        <Item
          title={'同步资源'}
          description={'从服务端同步可用的资源网站'}
          icon={<MaterialCommunityIcons name="cloud-sync-outline" />}
          onPress={() => setNeedReSync(true)}
        />
      </Column>
      <Modal isOpen={showEditResourceServerUrl} onClose={() => setShowEditResourceServerUrl(false)}>
        <Modal.Content>
          <Modal.Body>
            <FormControl>
              <FormControl.Label>服务地址</FormControl.Label>
              <Input
                variant="underlined"
                placeholder="配置后端服务地址"
                value={editResourceServerUrl}
                onChangeText={setEditResourceServerUrl}
              />
            </FormControl>
            <Button.Group className="mt-2 justify-end">
              <Button
                variant="ghost"
                colorScheme="blueGray"
                size="sm"
                onPress={() => setShowEditResourceServerUrl(false)}>
                Cancel
              </Button>
              <Button variant="ghost" size="sm" onPress={onSavePress}>
                Save
              </Button>
            </Button.Group>
          </Modal.Body>
        </Modal.Content>
      </Modal>
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
