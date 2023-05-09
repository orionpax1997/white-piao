import { MaterialCommunityIcons } from '@expo/vector-icons';
import { openBrowserAsync } from 'expo-web-browser';
import { Row, Heading, ScrollView, Switch, Badge, Icon, IconButton } from 'native-base';

import { useSource } from '../hooks';
import { Source } from '../modals';
import { SourceProvider } from '../providers';

const sourceProvider = SourceProvider.getProvider();

export default function SourcesPage() {
  const { list, byId, setById } = useSource();

  const onSourceToggle = (id: number, checked: boolean) => {
    const source = byId[id];
    source.isEnabled = checked ? 1 : 0;
    sourceProvider.update(source);
    setById({ ...byId, [id]: source });
  };

  return (
    <ScrollView>
      {list.length > 0 &&
        list.map(
          id => byId[id] && <SourceItem key={id} source={byId[id]} onToggle={checked => onSourceToggle(id, checked)} />
        )}
    </ScrollView>
  );
}

const SourceItem = ({ source, onToggle }: { source: Source; onToggle: (checked: boolean) => void }) => {
  const { name, baseURL, searchTime, isEnabled } = source;
  return (
    <Row className={`h-16 items-center justify-around border-b border-gray-200`}>
      <Heading className="flex-1 ml-5" size="sm">
        {name}
      </Heading>
      <Row className="mr-2 items-center justify-evenly w-38">
        {source.searchScript ? (
          <Badge
            colorScheme={searchTime < 400 ? 'success' : searchTime < 2000 ? 'warning' : 'error'}
            alignSelf="center"
            variant="subtle">
            {`${searchTime} ms`}
          </Badge>
        ) : (
          <Badge colorScheme="info" alignSelf="center" variant="outline">
            发现源
          </Badge>
        )}

        <Switch size="sm" isChecked={isEnabled === 1} onToggle={onToggle} />
        <IconButton
          borderRadius="full"
          icon={<Icon as={<MaterialCommunityIcons name="web" />} />}
          onPress={() => openBrowserAsync(baseURL)}
        />
      </Row>
    </Row>
  );
};
