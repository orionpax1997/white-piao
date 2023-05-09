import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Collapse, Column, Row, Heading, ScrollView, Icon, Pressable, Box, Button } from 'native-base';
import { useState } from 'react';

import { useSource } from '../hooks';
import { useDiscovery } from '../hooks/use-discovery';
import { Discovery, Source } from '../modals';

export default function DiscoveryPage() {
  const { list, byId } = useSource();

  return (
    <ScrollView>
      {list.length > 0 &&
        list
          .filter(
            id =>
              byId[id].isEnabled &&
              byId[id].discoveryList &&
              byId[id].discoveryList!.length > 0 &&
              byId[id].findDiscoveryScript &&
              byId[id].discoveryScript
          )
          .map(id => byId[id] && <SourceItem key={id} source={byId[id]} />)}
    </ScrollView>
  );
}

const SourceItem = ({ source }: { source: Source }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { setDiscovery } = useDiscovery();

  const navigation = useNavigation<any>();
  const { name } = source;

  const onDiscoveryPress = (discovery: Discovery) => {
    setDiscovery(discovery);
    navigation.navigate('DiscoveryDetailPage', { title: discovery.title });
  };

  return (
    <Column>
      <Pressable onPress={() => setIsOpen(!isOpen)}>
        <Row className={`h-14 px-3 items-center justify-around border-b border-gray-200`}>
          <Heading className="flex-1" size="sm">
            {name}
          </Heading>
          {isOpen ? (
            <Icon size="sm" borderRadius="full" as={<AntDesign name="down" />} />
          ) : (
            <Icon size="sm" borderRadius="full" as={<AntDesign name="right" />} />
          )}
        </Row>
      </Pressable>
      <Collapse isOpen={isOpen}>
        <Box className="gap-2 p-2 justify-between flex-wrap flex-row">
          {source.discoveryList!.map(discovery => (
            <Button
              onPress={() => onDiscoveryPress(discovery)}
              variant="outline"
              size="sm"
              className="flex-grow flex-shrink-0"
              key={discovery.id}>
              {discovery.title}
            </Button>
          ))}
        </Box>
      </Collapse>
    </Column>
  );
};
