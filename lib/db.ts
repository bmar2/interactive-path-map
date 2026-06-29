import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb"
import { awsCredentialsProvider } from "@vercel/functions/oidc"
import type { Waypoint } from "./waypoints"

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME
const PK = process.env.DYNAMODB_TABLE_PARTITION_KEY || "PK"
const SK = process.env.DYNAMODB_TABLE_SORT_KEY || "SK"

// Fixed partition value — all waypoints live under the same "waypoints" partition
const PARTITION_VALUE = "waypoint"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
})

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

export async function getAllWaypoints(): Promise<Waypoint[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "#pk = :pk",
      ExpressionAttributeNames: { "#pk": PK },
      ExpressionAttributeValues: { ":pk": PARTITION_VALUE },
    })
  )
  const items = (result.Items || []) as Array<Waypoint & Record<string, string>>
  // Strip the DynamoDB key attributes before returning domain objects
  const waypoints: Waypoint[] = items.map(({ [PK]: _pk, [SK]: _sk, ...rest }) => rest as Waypoint)
  // Sort by timestamp ascending so the path stays in chronological order
  return waypoints.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
}

export async function createWaypoint(waypoint: Waypoint): Promise<Waypoint> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        [PK]: PARTITION_VALUE,
        [SK]: waypoint.id,
        ...waypoint,
      },
    })
  )
  return waypoint
}

export async function deleteWaypoint(id: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        [PK]: PARTITION_VALUE,
        [SK]: id,
      },
    })
  )
}
