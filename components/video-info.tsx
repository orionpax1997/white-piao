import { Column, Row, AspectRatio, Image, Text } from 'native-base';

export const VideoInfo = ({
  title,
  actors,
  intro,
  image,
  sourceName,
}: {
  title: string;
  actors?: string;
  intro?: string;
  image?: string;
  sourceName: string;
}) => {
  return (
    <Row>
      {image && (
        <AspectRatio ratio={2 / 3}>
          <Image
            source={{
              uri: image,
            }}
            fallbackSource={{
              uri: 'https://cdn.staticaly.com/gh/Humble-Xiang/picx-images@master/geek/15659380625d56518ef0c8b.3nj1v9ieeeu0.webp',
            }}
            alt="image"
          />
        </AspectRatio>
      )}
      <Column className="p-2 h-40 justify-around flex-1">
        <Text noOfLines={1} className="text-gray-800 text-xl font-medium">
          {title}
        </Text>
        <Text noOfLines={1} className="text-sm text-gray-700">
          来源: {sourceName}
        </Text>
        {actors && (
          <Text noOfLines={1} className="text-sm text-gray-700">
            {actors}
          </Text>
        )}
        {intro && (
          <Text noOfLines={3} className="text-sm text-gray-700">
            {intro}
          </Text>
        )}
      </Column>
    </Row>
  );
};
