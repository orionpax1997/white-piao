import { Feather } from '@expo/vector-icons';
import { openBrowserAsync } from 'expo-web-browser';
import { Row, Heading, ScrollView, Switch, Badge, Icon, Menu, Pressable, useToast } from 'native-base';
import { useEffect, useState } from 'react';

import { WithLoading } from '../components';
import { SOURCE_CONSTANTS } from '../constants';
import { useSource } from '../hooks';
import { Source } from '../modals';
import { SourceProvider } from '../providers';

const sourceProvider = SourceProvider.getProvider();

export default function SourcesPage() {
  const [loading, setLoading] = useState(false);
  const { list, byId, setById, setList, setNeedReSync } = useSource();
  const toast = useToast();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const rows = await sourceProvider.read();
      // 资源为空时，自动同步一下
      if (rows.length === 0) {
        setNeedReSync(true);
        toast.show({ description: '资源为空, 正在自动初始化...' });
      }

      setById({
        ...rows.reduce((byId, item) => {
          byId[item[SOURCE_CONSTANTS.IDENTIFIER]] = Source.fromMap(item);
          return byId;
        }, {}),
      });
      setList(rows.map(item => item[SOURCE_CONSTANTS.IDENTIFIER]));
      setLoading(false);
    };

    init();
  }, []);

  const onSourceToggle = (id: number, checked: boolean) => {
    const source = byId[id];
    source.isEnabled = checked ? 1 : 0;
    sourceProvider.update(source);
    setById({ ...byId, [id]: source });
  };

  return (
    <WithLoading loading={loading}>
      <ScrollView>
        {list.length > 0 &&
          list.map(
            id =>
              byId[id] && <SourceItem key={id} source={byId[id]} onToggle={checked => onSourceToggle(id, checked)} />
          )}
      </ScrollView>
    </WithLoading>
  );
}

const SourceItem = ({ source, onToggle }: { source: Source; onToggle: (checked: boolean) => void }) => {
  const { name, baseURL, searchTime, isEnabled } = source;
  return (
    <Row className={`h-16 items-center justify-around border-b border-gray-200`}>
      <Heading className="flex-1 ml-5" size="sm">
        {name}
      </Heading>
      <Row className="mr-5 items-center justify-evenly w-38">
        <Badge
          colorScheme={searchTime < 400 ? 'success' : searchTime < 2000 ? 'warning' : 'error'}
          alignSelf="center"
          variant="subtle">
          {`${searchTime} ms`}
        </Badge>
        <Switch size="sm" isChecked={isEnabled === 1} onToggle={onToggle} />
        <Menu
          trigger={triggerProps => (
            <Pressable {...triggerProps}>
              <Icon as={<Feather name="more-vertical" />} />
            </Pressable>
          )}>
          <Menu.Item onPress={() => openBrowserAsync(baseURL)}>浏览器打开</Menu.Item>
        </Menu>
      </Row>
    </Row>
  );
};
